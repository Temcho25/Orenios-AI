"use client";

import { motion } from "framer-motion";
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createClient } from "../lib/supabase";
import NoteEditor from "./NoteEditor";
import NoteList from "./NoteList";

export type Note = {
  id: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
};

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
    <section className="rounded-3xl border border-card-border bg-card p-5 backdrop-blur-[12px] sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Notes
          </p>

          <p className="mt-1 text-xs text-foreground/40">
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
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30"
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
              className="h-11 w-full rounded-2xl border border-muted-border bg-muted pl-11 pr-4 text-sm text-foreground outline-none transition placeholder:text-foreground/30 focus:border-accent-violet/40 focus:ring-4 focus:ring-accent-violet/10 sm:w-64"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            type="button"
            onClick={openCreateEditor}
            className="cta-gradient flex h-11 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(124,111,240,0.3)]"
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
          className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
        >
          {errorMessage}
        </motion.div>
      )}

      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          role="status"
          className="mt-5 rounded-2xl border border-accent-mint/30 bg-accent-mint/10 px-4 py-3 text-sm leading-5 text-emerald-700 dark:text-accent-mint"
        >
          {successMessage}
        </motion.div>
      )}

      <NoteEditor
        editorOpen={editorOpen}
        editingNoteId={editingNoteId}
        title={title}
        content={content}
        savingNote={savingNote}
        onTitleChange={setTitle}
        onContentChange={setContent}
        onSubmit={handleSaveNote}
        onClose={resetEditor}
      />

      <div className="mt-6">
        <NoteList
          notes={filteredNotes}
          loadingNotes={loadingNotes}
          pendingNoteIds={pendingNoteIds}
          searchQuery={searchQuery}
          onEdit={openEditEditor}
          onDelete={deleteNote}
          onCreateFirstNoteClick={openCreateEditor}
        />
      </div>
    </section>
  );
}
