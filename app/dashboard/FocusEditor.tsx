"use client";

import { motion } from "framer-motion";
import type { FormEvent } from "react";

type FocusEditorProps = {
  title: string;
  description: string;
  progress: number;
  saving: boolean;
  deleting: boolean;
  hasFocus: boolean;
  errorMessage: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onProgressChange: (value: number) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
};

export default function FocusEditor({
  title,
  description,
  progress,
  saving,
  deleting,
  hasFocus,
  errorMessage,
  onTitleChange,
  onDescriptionChange,
  onProgressChange,
  onSubmit,
  onCancel,
}: FocusEditorProps) {
  return (
    <motion.form
      key="focus-form"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{
        duration: 0.25,
        ease: [0.22, 1, 0.36, 1],
      }}
      onSubmit={onSubmit}
      className="mt-6 rounded-3xl border border-accent-violet/15 bg-accent-violet/[0.04] p-5"
    >
      <div>
        <label
          htmlFor="focus-title"
          className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300"
        >
          Main objective
        </label>

        <input
          id="focus-title"
          type="text"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="What matters most today?"
          maxLength={140}
          disabled={saving || deleting}
          className="mt-3 h-12 w-full rounded-2xl border border-muted-border bg-muted px-4 text-sm font-medium text-foreground outline-none transition placeholder:text-foreground/30 focus:border-accent-violet/40 focus:ring-4 focus:ring-accent-violet/10 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>

      <div className="mt-4">
        <label
          htmlFor="focus-description"
          className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300"
        >
          Why it matters
        </label>

        <textarea
          id="focus-description"
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          placeholder="Add a short note about this priority..."
          maxLength={300}
          rows={4}
          disabled={saving || deleting}
          className="mt-3 w-full resize-none rounded-2xl border border-muted-border bg-muted px-4 py-3 text-sm leading-6 text-foreground outline-none transition placeholder:text-foreground/30 focus:border-accent-violet/40 focus:ring-4 focus:ring-accent-violet/10 disabled:cursor-not-allowed disabled:opacity-60"
        />

        <p className="mt-2 text-right text-xs text-foreground/30">
          {description.length}/300
        </p>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between gap-4">
          <label
            htmlFor="focus-progress"
            className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300"
          >
            Progress
          </label>

          <span className="rounded-full bg-surface-strong px-3 py-1 text-xs font-semibold text-foreground/70">
            {progress}%
          </span>
        </div>

        <input
          id="focus-progress"
          type="range"
          min="0"
          max="100"
          step="5"
          value={progress}
          onChange={(event) => onProgressChange(Number(event.target.value))}
          disabled={saving || deleting}
          className="mt-4 w-full cursor-pointer accent-accent-mint disabled:cursor-not-allowed"
        />

        <div className="mt-2 flex justify-between text-[10px] font-medium uppercase tracking-[0.12em] text-foreground/30">
          <span>Not started</span>
          <span>Complete</span>
        </div>
      </div>

      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          role="alert"
          className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
        >
          {errorMessage}
        </motion.div>
      )}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <motion.button
          whileHover={saving ? undefined : { scale: 1.015 }}
          whileTap={saving ? undefined : { scale: 0.985 }}
          type="submit"
          disabled={saving || deleting || !title.trim()}
          className="cta-gradient flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(124,111,240,0.3)] transition disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:flex-1"
        >
          {saving ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Saving...
            </>
          ) : (
            <>
              Save focus
              <span aria-hidden="true">→</span>
            </>
          )}
        </motion.button>

        {hasFocus && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving || deleting}
            className="flex h-12 w-full shrink-0 items-center justify-center rounded-2xl border border-muted-border bg-muted px-5 text-sm font-semibold text-foreground/60 transition hover:border-border-strong hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            Cancel
          </button>
        )}
      </div>
    </motion.form>
  );
}
