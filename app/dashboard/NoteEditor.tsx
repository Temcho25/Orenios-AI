"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { FormEvent } from "react";

type NoteEditorProps = {
  editorOpen: boolean;
  editingNoteId: string | null;
  title: string;
  content: string;
  savingNote: boolean;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
};

export default function NoteEditor({
  editorOpen,
  editingNoteId,
  title,
  content,
  savingNote,
  onTitleChange,
  onContentChange,
  onSubmit,
  onClose,
}: NoteEditorProps) {
  return (
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
          onSubmit={onSubmit}
          className="mt-6 overflow-hidden rounded-3xl border border-accent-violet/15 bg-accent-violet/[0.04]"
        >
          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">
                  {editingNoteId ? "Edit note" : "New note"}
                </p>

                <p className="mt-1 text-xs text-foreground/40">
                  Write freely — everything is saved to your
                  account
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={savingNote}
                aria-label="Close note editor"
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-strong text-xl text-foreground/40 transition hover:text-foreground disabled:cursor-not-allowed"
              >
                ×
              </button>
            </div>

            <div className="mt-5">
              <label
                htmlFor="note-title"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-violet-300"
              >
                Title
              </label>

              <input
                id="note-title"
                type="text"
                value={title}
                onChange={(event) => onTitleChange(event.target.value)}
                placeholder="Note title"
                maxLength={140}
                disabled={savingNote}
                autoFocus
                className="h-12 w-full rounded-2xl border border-muted-border bg-muted px-4 text-sm font-medium text-foreground outline-none transition placeholder:text-foreground/30 focus:border-accent-violet/40 focus:ring-4 focus:ring-accent-violet/10 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between gap-4">
                <label
                  htmlFor="note-content"
                  className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-300"
                >
                  Content
                </label>

                <span className="text-xs text-foreground/30">
                  {content.length} characters
                </span>
              </div>

              <textarea
                id="note-content"
                value={content}
                onChange={(event) => onContentChange(event.target.value)}
                placeholder="Start writing your note..."
                rows={10}
                disabled={savingNote}
                className="w-full resize-y rounded-2xl border border-muted-border bg-muted px-4 py-4 text-sm leading-7 text-foreground outline-none transition placeholder:text-foreground/30 focus:border-accent-violet/40 focus:ring-4 focus:ring-accent-violet/10 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <motion.button
                whileHover={savingNote ? undefined : { scale: 1.01 }}
                whileTap={savingNote ? undefined : { scale: 0.99 }}
                type="submit"
                disabled={savingNote || !title.trim()}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-muted-border bg-surface-strong px-5 text-sm font-semibold text-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingNote ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-border-strong border-t-foreground" />
                    Saving note...
                  </>
                ) : (
                  <>
                    {editingNoteId ? "Update note" : "Create note"}
                    <span aria-hidden="true">→</span>
                  </>
                )}
              </motion.button>

              <button
                type="button"
                onClick={onClose}
                disabled={savingNote}
                className="h-12 rounded-2xl border border-muted-border bg-muted px-5 text-sm font-semibold text-foreground/60 transition hover:border-border-strong hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
