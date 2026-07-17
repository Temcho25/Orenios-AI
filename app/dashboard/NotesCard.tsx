"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createClient } from "../lib/supabase";

type Note = {
  id: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
};

function formatUpdatedDate(date: string) {
  const value = new Date(date);

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function getPreview(content: string | null) {
  const normalizedContent = content?.trim();

  if (!normalizedContent) {
    return "No additional content.";
  }

  if (normalizedContent.length <= 150) {
    return normalizedContent;
  }

  return `${normalizedContent.slice(0, 150)}...`;
}

export default function NotesCard() {
  const [notes, setNotes] = useState<Note[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<
    string | null
  >(null);

  const [loadingNotes, setLoadingNotes] = useState(true);
  const [savingNote, setSavingNote] = useState(false);
  const [pendingNoteIds, setPendingNoteIds] = useState<
    string[]
  >([]);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadNotes() {
      setErrorMessage("");

      try {
        const supabase = createClient();

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          throw new Error(
            "Your session has expired. Please sign in again."
          );
        }

        const { data, error } = await supabase
          .from("notes")
          .select(
            "id, title, content, created_at, updated_at"
          )
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false });

        if (error) {
          throw error;
        }

        if (!cancelled) {
          setNotes((data ?? []) as Note[]);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Could not load your notes."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingNotes(false);
        }
      }
    }

    loadNotes();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredNotes = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return notes;
    }

    return notes.filter((note) => {
      const noteTitle = note.title.toLowerCase();
      const noteContent = note.content?.toLowerCase() ?? "";

      return (
        noteTitle.includes(normalizedQuery) ||
        noteContent.includes(normalizedQuery)
      );
    });
  }, [notes, searchQuery]);

  function setNotePending(noteId: string, pending: boolean) {
    setPendingNoteIds((currentIds) =>
      pending
        ? [...currentIds, noteId]
        : currentIds.filter((id) => id !== noteId)
    );
  }

  function resetEditor() {
    setTitle("");
    setContent("");
    setEditingNoteId(null);
    setEditorOpen(false);
    setErrorMessage("");
  }

  function openCreateEditor() {
    setTitle("");
    setContent("");
    setEditingNoteId(null);
    setEditorOpen(true);
    setErrorMessage("");
    setSuccessMessage("");
  }

  function openEditEditor(note: Note) {
    setTitle(note.title);
    setContent(note.content ?? "");
    setEditingNoteId(note.id);
    setEditorOpen(true);
    setErrorMessage("");
    setSuccessMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSaveNote(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const normalizedTitle = title.trim();
    const normalizedContent = content.trim();

    setErrorMessage("");
    setSuccessMessage("");

    if (!normalizedTitle) {
      setErrorMessage("Please enter a title for your note.");
      return;
    }

    setSavingNote(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(
          "Your session has expired. Please sign in again."
        );
      }

      const updatedAt = new Date().toISOString();

      if (editingNoteId) {
        const { data, error } = await supabase
          .from("notes")
          .update({
            title: normalizedTitle,
            content: normalizedContent || null,
            updated_at: updatedAt,
          })
          .eq("id", editingNoteId)
          .eq("user_id", user.id)
          .select(
            "id, title, content, created_at, updated_at"
          )
          .single();

        if (error) {
          throw error;
        }

        const updatedNote = data as Note;

        setNotes((currentNotes) =>
          currentNotes
            .map((note) =>
              note.id === editingNoteId
                ? updatedNote
                : note
            )
            .sort(
              (firstNote, secondNote) =>
                new Date(secondNote.updated_at).getTime() -
                new Date(firstNote.updated_at).getTime()
            )
        );

        setSuccessMessage("Your note has been updated.");
      } else {
        const { data, error } = await supabase
          .from("notes")
          .insert({
            user_id: user.id,
            title: normalizedTitle,
            content: normalizedContent || null,
            updated_at: updatedAt,
          })
          .select(
            "id, title, content, created_at, updated_at"
          )
          .single();

        if (error) {
          throw error;
        }

        const createdNote = data as Note;

        setNotes((currentNotes) => [
          createdNote,
          ...currentNotes,
        ]);

        setSuccessMessage("Your note has been created.");
      }

      setTitle("");
      setContent("");
      setEditingNoteId(null);
      setEditorOpen(false);

      window.setTimeout(() => {
        setSuccessMessage("");
      }, 2500);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not save your note."
      );
    } finally {
      setSavingNote(false);
    }
  }

  async function deleteNote(note: Note) {
    if (pendingNoteIds.includes(note.id)) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setNotePending(note.id, true);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(
          "Your session has expired. Please sign in again."
        );
      }

      const { error } = await supabase
        .from("notes")
        .delete()
        .eq("id", note.id)
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      setNotes((currentNotes) =>
        currentNotes.filter(
          (currentNote) => currentNote.id !== note.id
        )
      );

      if (editingNoteId === note.id) {
        resetEditor();
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not delete the note."
      );
    } finally {
      setNotePending(note.id, false);
    }
  }

  return (
    <section className="rounded-[30px] border border-gray-200/80 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.07)] sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-950">
            Notes
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Capture ideas, thoughts and information you want to
            remember
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative">
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            >
              <circle
                cx="11"
                cy="11"
                r="7"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="m16.5 16.5 4 4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>

            <input
              type="search"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              placeholder="Search notes..."
              className="h-11 w-full rounded-2xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100 sm:w-64"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            type="button"
            onClick={openCreateEditor}
            className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-gray-950 px-5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(15,23,42,0.16)] transition hover:bg-black"
          >
            New note
            <span aria-hidden="true">+</span>
          </motion.button>
        </div>
      </div>

      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          role="alert"
          className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
        >
          {errorMessage}
        </motion.div>
      )}

      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          role="status"
          className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-5 text-emerald-700"
        >
          {successMessage}
        </motion.div>
      )}

      <AnimatePresence>
        {editorOpen && (
          <motion.form
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{
              duration: 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
            onSubmit={handleSaveNote}
            className="mt-6 overflow-hidden rounded-[26px] border border-violet-100 bg-gradient-to-br from-violet-50 to-blue-50"
          >
            <div className="p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-500">
                    {editingNoteId ? "Edit note" : "New note"}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Write freely — everything is saved to your
                    account
                  </p>
                </div>

                <button
                  type="button"
                  onClick={resetEditor}
                  disabled={savingNote}
                  aria-label="Close note editor"
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl text-gray-400 shadow-sm transition hover:text-gray-950 disabled:cursor-not-allowed"
                >
                  ×
                </button>
              </div>

              <div className="mt-5">
                <label
                  htmlFor="note-title"
                  className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-violet-500"
                >
                  Title
                </label>

                <input
                  id="note-title"
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="Note title"
                  maxLength={140}
                  disabled={savingNote}
                  autoFocus
                  className="h-12 w-full rounded-2xl border border-white/80 bg-white px-4 text-sm font-medium text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between gap-4">
                  <label
                    htmlFor="note-content"
                    className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-500"
                  >
                    Content
                  </label>

                  <span className="text-xs text-gray-400">
                    {content.length} characters
                  </span>
                </div>

                <textarea
                  id="note-content"
                  value={content}
                  onChange={(event) =>
                    setContent(event.target.value)
                  }
                  placeholder="Start writing your note..."
                  rows={10}
                  disabled={savingNote}
                  className="w-full resize-y rounded-2xl border border-white/80 bg-white px-4 py-4 text-sm leading-7 text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <motion.button
                  whileHover={
                    savingNote ? undefined : { scale: 1.01 }
                  }
                  whileTap={
                    savingNote ? undefined : { scale: 0.99 }
                  }
                  type="submit"
                  disabled={savingNote || !title.trim()}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-gray-950 px-5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(15,23,42,0.16)] transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingNote ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Saving note...
                    </>
                  ) : (
                    <>
                      {editingNoteId
                        ? "Update note"
                        : "Create note"}
                      <span aria-hidden="true">→</span>
                    </>
                  )}
                </motion.button>

                <button
                  type="button"
                  onClick={resetEditor}
                  disabled={savingNote}
                  className="h-12 rounded-2xl border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:text-gray-950 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="mt-6">
        {loadingNotes ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-[24px] border border-gray-100 bg-gray-50 p-5"
              >
                <div className="h-4 w-2/3 rounded-full bg-gray-200" />
                <div className="mt-4 h-3 w-full rounded-full bg-gray-200" />
                <div className="mt-2 h-3 w-5/6 rounded-full bg-gray-100" />
                <div className="mt-2 h-3 w-3/4 rounded-full bg-gray-100" />
                <div className="mt-7 h-3 w-28 rounded-full bg-gray-100" />
              </div>
            ))}
          </div>
        ) : filteredNotes.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence initial={false}>
              {filteredNotes.map((note) => {
                const notePending = pendingNoteIds.includes(
                  note.id
                );

                return (
                  <motion.article
                    key={note.id}
                    layout
                    initial={{
                      opacity: 0,
                      y: 10,
                      scale: 0.99,
                    }}
                    animate={{
                      opacity: notePending ? 0.6 : 1,
                      y: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      y: -10,
                      scale: 0.98,
                    }}
                    transition={{
                      duration: 0.25,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="group flex min-h-[240px] flex-col rounded-[24px] border border-gray-200 bg-white p-5 transition hover:border-violet-200 hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M6 3.5h9l3 3V20H6V3.5Z"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M14.5 3.5V7H18M9 11h6M9 15h6"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditEditor(note)}
                          disabled={notePending}
                          aria-label={`Edit "${note.title}"`}
                          className="flex h-11 w-11 items-center justify-center rounded-xl text-gray-300 opacity-100 transition hover:bg-violet-50 hover:text-violet-600 disabled:cursor-wait sm:opacity-0 sm:group-hover:opacity-100"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden="true"
                          >
                            <path
                              d="m4 20 4.3-1 10.4-10.4a2.1 2.1 0 0 0-3-3L5.3 16 4 20Z"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteNote(note)}
                          disabled={notePending}
                          aria-label={`Delete "${note.title}"`}
                          className="flex h-11 w-11 items-center justify-center rounded-xl text-gray-300 opacity-100 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-wait sm:opacity-0 sm:group-hover:opacity-100"
                        >
                          {notePending ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                          ) : (
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              aria-hidden="true"
                            >
                              <path
                                d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <h3 className="mt-5 text-lg font-semibold tracking-[-0.025em] text-gray-950">
                      {note.title}
                    </h3>

                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-500">
                      {getPreview(note.content)}
                    </p>

                    <div className="mt-auto border-t border-gray-100 pt-4">
                      <p className="text-xs text-gray-400">
                        Updated {formatUpdatedDate(note.updated_at)}
                      </p>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[26px] border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-violet-600 shadow-sm">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M6 3.5h9l3 3V20H6V3.5Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path
                  d="M14.5 3.5V7H18M9 11h6M9 15h6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <p className="mt-5 text-sm font-semibold text-gray-800">
              {searchQuery
                ? "No notes matched your search."
                : "You don’t have any notes yet."}
            </p>

            <p className="mt-2 text-sm leading-6 text-gray-400">
              {searchQuery
                ? "Try searching with a different word."
                : "Create your first note and keep important thoughts inside Orenios."}
            </p>

            {!searchQuery && (
              <button
                type="button"
                onClick={openCreateEditor}
                className="mt-5 rounded-2xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-black"
              >
                Create first note
              </button>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}
