"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FormEvent, useEffect, useState } from "react";
import { createClient } from "../lib/supabase";

type DailyFocus = {
  id: string;
  title: string;
  description: string | null;
  progress: number;
  focus_date: string;
};

function getLocalDate() {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60_000;

  return new Date(now.getTime() - timezoneOffset)
    .toISOString()
    .split("T")[0];
}

export default function FocusCard() {
  const [focus, setFocus] = useState<DailyFocus | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [progress, setProgress] = useState(0);

  const [editing, setEditing] = useState(false);
  const [loadingFocus, setLoadingFocus] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadFocus() {
      setErrorMessage("");

      try {
        const supabase = createClient();

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          throw new Error("Your session has expired. Please sign in again.");
        }

        const today = getLocalDate();

        const { data, error } = await supabase
          .from("daily_focus")
          .select("id, title, description, progress, focus_date")
          .eq("user_id", user.id)
          .eq("focus_date", today)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (!cancelled && data) {
          setFocus(data);
          setTitle(data.title);
          setDescription(data.description ?? "");
          setProgress(data.progress);
        }

        if (!cancelled && !data) {
          setEditing(true);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Could not load today’s focus."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingFocus(false);
        }
      }
    }

    loadFocus();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedTitle = title.trim();
    const normalizedDescription = description.trim();

    setErrorMessage("");
    setSuccessMessage("");

    if (!normalizedTitle) {
      setErrorMessage("Please enter your main focus for today.");
      return;
    }

    setSaving(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      const today = getLocalDate();

      const { data, error } = await supabase
        .from("daily_focus")
        .upsert(
          {
            user_id: user.id,
            focus_date: today,
            title: normalizedTitle,
            description: normalizedDescription || null,
            progress,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id,focus_date",
          }
        )
        .select("id, title, description, progress, focus_date")
        .single();

      if (error) {
        throw error;
      }

      setFocus(data);
      setTitle(data.title);
      setDescription(data.description ?? "");
      setProgress(data.progress);
      setEditing(false);
      setSuccessMessage("Today’s focus has been saved.");

      window.setTimeout(() => {
        setSuccessMessage("");
      }, 2500);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not save today’s focus."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!focus || deleting) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setDeleting(true);

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
        .from("daily_focus")
        .delete()
        .eq("id", focus.id)
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      setFocus(null);
      setTitle("");
      setDescription("");
      setProgress(0);
      setEditing(true);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not remove today’s focus."
      );
    } finally {
      setDeleting(false);
    }
  }

  function cancelEditing() {
    if (!focus) {
      setTitle("");
      setDescription("");
      setProgress(0);
      return;
    }

    setTitle(focus.title);
    setDescription(focus.description ?? "");
    setProgress(focus.progress);
    setEditing(false);
    setErrorMessage("");
  }

  if (loadingFocus) {
    return (
      <section className="rounded-3xl border border-card-border bg-card p-6 backdrop-blur-[12px]">
        <div className="animate-pulse">
          <div className="h-4 w-28 rounded-full bg-surface-strong" />
          <div className="mt-3 h-3 w-48 rounded-full bg-muted" />

          <div className="mt-6 rounded-3xl border border-card-border bg-card p-5">
            <div className="h-3 w-24 rounded-full bg-surface-strong" />
            <div className="mt-4 h-6 w-4/5 rounded-full bg-surface-strong" />
            <div className="mt-3 h-4 w-full rounded-full bg-muted" />
            <div className="mt-2 h-4 w-3/4 rounded-full bg-muted" />
            <div className="mt-6 h-2 w-full rounded-full bg-surface-strong" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-card-border bg-card p-6 backdrop-blur-[12px]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Today&apos;s Focus
          </p>

          <p className="mt-1 text-xs text-foreground/40">
            Your highest-impact priority for today
          </p>
        </div>

        {!editing && focus && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex min-h-[44px] items-center rounded-full bg-accent-violet/15 px-4 text-xs font-semibold text-accent-violet transition hover:bg-accent-violet/25"
          >
            Edit
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {editing ? (
          <motion.form
            key="focus-form"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{
              duration: 0.25,
              ease: [0.22, 1, 0.36, 1],
            }}
            onSubmit={handleSave}
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
                onChange={(event) => setTitle(event.target.value)}
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
                onChange={(event) => setDescription(event.target.value)}
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
                onChange={(event) =>
                  setProgress(Number(event.target.value))
                }
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

              {focus && (
                <button
                  type="button"
                  onClick={cancelEditing}
                  disabled={saving || deleting}
                  className="flex h-12 w-full shrink-0 items-center justify-center rounded-2xl border border-muted-border bg-muted px-5 text-sm font-semibold text-foreground/60 transition hover:border-border-strong hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  Cancel
                </button>
              )}
            </div>
          </motion.form>
        ) : focus ? (
          <motion.div
            key="focus-display"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{
              duration: 0.25,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-6 rounded-3xl border border-accent-violet/15 bg-accent-violet/[0.04] p-5"
          >
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">
                Main objective
              </p>

              <span className="rounded-full bg-surface-strong px-3 py-1 text-xs font-semibold text-foreground/70">
                {focus.progress}%
              </span>
            </div>

            <h3 className="mt-3 text-xl font-semibold tracking-[-0.025em] text-foreground">
              {focus.title}
            </h3>

            {focus.description && (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground/50">
                {focus.description}
              </p>
            )}

            <div className="mt-5 flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-strong">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${focus.progress}%` }}
                  transition={{
                    duration: 0.5,
                    ease: "easeOut",
                  }}
                  className="h-full rounded-full bg-accent-mint"
                />
              </div>

              <span className="text-xs font-semibold text-foreground/50">
                {focus.progress}%
              </span>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-card-border pt-4">
              <p className="text-xs text-foreground/40">
                Saved securely to your account
              </p>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex min-h-[44px] items-center text-xs font-semibold text-foreground/40 transition hover:text-red-600 dark:hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? "Removing..." : "Remove"}
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          role="status"
          className="mt-4 rounded-2xl border border-accent-mint/30 bg-accent-mint/10 px-4 py-3 text-sm leading-5 text-emerald-700 dark:text-accent-mint"
        >
          {successMessage}
        </motion.div>
      )}

      {!editing && errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          role="alert"
          className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
        >
          {errorMessage}
        </motion.div>
      )}
    </section>
  );
}
