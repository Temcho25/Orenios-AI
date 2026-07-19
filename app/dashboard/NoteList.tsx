"use client";

import { AnimatePresence, motion } from "framer-motion";
import { formatUpdatedDate, getPreview } from "./lib/notes-helpers";
import type { Note } from "./NotesCard";

type NoteListProps = {
  notes: Note[];
  loadingNotes: boolean;
  pendingNoteIds: string[];
  searchQuery: string;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
  onCreateFirstNoteClick: () => void;
};

export default function NoteList({
  notes,
  loadingNotes,
  pendingNoteIds,
  searchQuery,
  onEdit,
  onDelete,
  onCreateFirstNoteClick,
}: NoteListProps) {
  if (loadingNotes) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="animate-pulse rounded-3xl border border-card-border bg-card p-5"
          >
            <div className="h-4 w-2/3 rounded-full bg-surface-strong" />
            <div className="mt-4 h-3 w-full rounded-full bg-surface-strong" />
            <div className="mt-2 h-3 w-5/6 rounded-full bg-muted" />
            <div className="mt-2 h-3 w-3/4 rounded-full bg-muted" />
            <div className="mt-7 h-3 w-28 rounded-full bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-dashed border-muted-border bg-card px-6 py-12 text-center"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-violet/15 text-accent-violet">
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

        <p className="mt-5 text-sm font-semibold text-foreground/80">
          {searchQuery
            ? "No notes matched your search."
            : "You don’t have any notes yet."}
        </p>

        <p className="mt-2 text-sm leading-6 text-foreground/40">
          {searchQuery
            ? "Try searching with a different word."
            : "Create your first note and keep important thoughts inside Orenios."}
        </p>

        {!searchQuery && (
          <button
            type="button"
            onClick={onCreateFirstNoteClick}
            className="mt-5 rounded-2xl border border-muted-border bg-muted px-5 py-3 text-sm font-semibold text-foreground transition hover:border-border-strong hover:bg-surface-strong"
          >
            Create first note
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <AnimatePresence initial={false}>
        {notes.map((note) => {
          const notePending = pendingNoteIds.includes(note.id);

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
              className="group flex min-h-[240px] flex-col rounded-3xl border border-card-border bg-card p-5 backdrop-blur-[12px] transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-violet/25 hover:bg-muted hover:shadow-[0_20px_45px_-15px_rgba(124,111,240,0.35)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-violet/15 text-accent-violet">
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
                    onClick={() => onEdit(note)}
                    disabled={notePending}
                    aria-label={`Edit "${note.title}"`}
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-foreground/25 opacity-100 transition hover:bg-accent-violet/15 hover:text-accent-violet disabled:cursor-wait sm:opacity-0 sm:group-hover:opacity-100"
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
                    onClick={() => onDelete(note)}
                    disabled={notePending}
                    aria-label={`Delete "${note.title}"`}
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-foreground/25 opacity-100 transition hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 disabled:cursor-wait sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    {notePending ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-border-strong border-t-foreground/60" />
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

              <h3 className="mt-5 text-lg font-semibold tracking-[-0.025em] text-foreground">
                {note.title}
              </h3>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground/50">
                {getPreview(note.content)}
              </p>

              <div className="mt-auto border-t border-card-border pt-4">
                <p className="text-xs text-foreground/40">
                  Updated {formatUpdatedDate(note.updated_at)}
                </p>
              </div>
            </motion.article>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
