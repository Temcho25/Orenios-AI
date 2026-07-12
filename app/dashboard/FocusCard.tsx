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

      const { error } = await supabase
        .from("daily_focus")
        .delete()
        .eq("id", focus.id);

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
      <section className="rounded-[28px] border border-gray-200/80 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <div className="animate-pulse">
          <div className="h-4 w-28 rounded-full bg-gray-200" />
          <div className="mt-3 h-3 w-48 rounded-full bg-gray-100" />

          <div className="mt-6 rounded-3xl border border-gray-100 bg-gray-50 p-5">
            <div className="h-3 w-24 rounded-full bg-gray-200" />
            <div className="mt-4 h-6 w-4/5 rounded-full bg-gray-200" />
            <div className="mt-3 h-4 w-full rounded-full bg-gray-100" />
            <div className="mt-2 h-4 w-3/4 rounded-full bg-gray-100" />
            <div className="mt-6 h-2 w-full rounded-full bg-gray-200" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[28px] border border-gray-200/80 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-950">
            Today&apos;s Focus
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Your highest-impact priority for today
          </p>
        </div>

        {!editing && focus && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-600 transition hover:bg-violet-100"
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
            className="mt-6 rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 to-blue-50 p-5"
          >
            <div>
              <label
                htmlFor="focus-title"
                className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-500"
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
                className="mt-3 h-12 w-full rounded-2xl border border-white/80 bg-white/90 px-4 text-sm font-medium text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <div className="mt-4">
              <label
                htmlFor="focus-description"
                className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-500"
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
                className="mt-3 w-full resize-none rounded-2xl border border-white/80 bg-white/90 px-4 py-3 text-sm leading-6 text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <p className="mt-2 text-right text-xs text-gray-400">
                {description.length}/300
              </p>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between gap-4">
                <label
                  htmlFor="focus-progress"
                  className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-500"
                >
                  Progress
                </label>

                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-600 shadow-sm">
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
                className="mt-4 w-full cursor-pointer accent-violet-600 disabled:cursor-not-allowed"
              />

              <div className="mt-2 flex justify-between text-[10px] font-medium uppercase tracking-[0.12em] text-gray-400">
                <span>Not started</span>
                <span>Complete</span>
              </div>
            </div>

            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                role="alert"
                className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
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
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-gray-950 px-5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(15,23,42,0.16)] transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
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
                  className="h-12 rounded-2xl border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:text-gray-950 disabled:cursor-not-allowed disabled:opacity-60"
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
            className="mt-6 rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 to-blue-50 p-5"
          >
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-500">
                Main objective
              </p>

              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-600 shadow-sm">
                {focus.progress}%
              </span>
            </div>

            <h3 className="mt-3 text-xl font-semibold tracking-[-0.025em] text-gray-950">
              {focus.title}
            </h3>

            {focus.description && (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-500">
                {focus.description}
              </p>
            )}

            <div className="mt-5 flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${focus.progress}%` }}
                  transition={{
                    duration: 0.6,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
                />
              </div>

              <span className="text-xs font-semibold text-gray-500">
                {focus.progress}%
              </span>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-violet-100 pt-4">
              <p className="text-xs text-gray-400">
                Saved securely to your account
              </p>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="text-xs font-semibold text-gray-400 transition hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-60"
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
          className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-5 text-emerald-700"
        >
          {successMessage}
        </motion.div>
      )}

      {!editing && errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          role="alert"
          className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
        >
          {errorMessage}
        </motion.div>
      )}
    </section>
  );
}