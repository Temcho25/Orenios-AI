"use client";

import { motion } from "framer-motion";
import {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  getGoalStatusForProgress,
  normalizeGoalState,
  type GoalStatus,
} from "../lib/goal-state";
import { createClient } from "../lib/supabase";
import GoalList from "./GoalList";

export type Goal = {
  id: string;
  title: string;
  description: string | null;
  progress: number;
  status: GoalStatus;
  deadline: string | null;
  created_at: string;
};

const statusOptions: GoalStatus[] = [
  "Not Started",
  "In Progress",
  "Completed",
];

export default function GoalsCard() {
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [goals, setGoals] = useState<Goal[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<GoalStatus>("Not Started");
  const [deadline, setDeadline] = useState("");

  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);

  const [loadingGoals, setLoadingGoals] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pendingGoalIds, setPendingGoalIds] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadGoals() {
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

        const { data, error } = await supabase
          .from("goals")
          .select(
            "id, title, description, progress, status, deadline, created_at"
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        if (!cancelled) {
          setGoals((data ?? []) as Goal[]);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Could not load your goals."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingGoals(false);
        }
      }
    }

    loadGoals();

    return () => {
      cancelled = true;
    };
  }, []);

  const completedGoals = useMemo(
    () => goals.filter((goal) => goal.status === "Completed").length,
    [goals]
  );

  function resetForm() {
    setTitle("");
    setDescription("");
    setProgress(0);
    setStatus("Not Started");
    setDeadline("");
    setEditingGoalId(null);
  }

  function focusNewGoalForm() {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });

    window.setTimeout(() => {
      titleInputRef.current?.focus();
    }, 350);
  }

  function setGoalPending(goalId: string, pending: boolean) {
    setPendingGoalIds((currentIds) =>
      pending
        ? [...currentIds, goalId]
        : currentIds.filter((id) => id !== goalId)
    );
  }

  function startEditing(goal: Goal) {
    setEditingGoalId(goal.id);
    setTitle(goal.title);
    setDescription(goal.description ?? "");
    setProgress(goal.progress);
    setStatus(goal.status);
    setDeadline(goal.deadline ?? "");
    setErrorMessage("");

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  }

  async function handleSaveGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedTitle = title.trim();
    const normalizedDescription = description.trim();

    if (!normalizedTitle || saving) {
      return;
    }

    setErrorMessage("");
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

      const normalizedState = normalizeGoalState({
        status,
        progress,
      });

      const goalPayload = {
        user_id: user.id,
        title: normalizedTitle,
        description: normalizedDescription || null,
        progress: normalizedState.progress,
        status: normalizedState.status,
        deadline: deadline || null,
      };

      if (editingGoalId) {
        const { data, error } = await supabase
          .from("goals")
          .update(goalPayload)
          .eq("id", editingGoalId)
          .eq("user_id", user.id)
          .select(
            "id, title, description, progress, status, deadline, created_at"
          )
          .single();

        if (error) {
          throw error;
        }

        setGoals((currentGoals) =>
          currentGoals.map((goal) =>
            goal.id === editingGoalId ? (data as Goal) : goal
          )
        );
      } else {
        const { data, error } = await supabase
          .from("goals")
          .insert(goalPayload)
          .select(
            "id, title, description, progress, status, deadline, created_at"
          )
          .single();

        if (error) {
          throw error;
        }

        setGoals((currentGoals) => [data as Goal, ...currentGoals]);
      }

      resetForm();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not save the goal."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteGoal(goal: Goal) {
    if (pendingGoalIds.includes(goal.id)) {
      return;
    }

    setErrorMessage("");
    setGoalPending(goal.id, true);

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
        .from("goals")
        .delete()
        .eq("id", goal.id)
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      setGoals((currentGoals) =>
        currentGoals.filter((currentGoal) => currentGoal.id !== goal.id)
      );

      if (editingGoalId === goal.id) {
        resetForm();
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not delete the goal."
      );
    } finally {
      setGoalPending(goal.id, false);
    }
  }

  return (
    <section className="rounded-3xl border border-card-border bg-card p-6 backdrop-blur-[12px]">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Goals</p>

          <p className="mt-1 text-xs text-foreground/40">
            Long-term outcomes connected to your daily work
          </p>
        </div>

        <div className="rounded-full bg-accent-violet/15 px-3 py-1.5 text-xs font-semibold text-accent-violet">
          {completedGoals} of {goals.length} completed
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

      <div className="mt-6">
        <GoalList
          goals={goals}
          loadingGoals={loadingGoals}
          pendingGoalIds={pendingGoalIds}
          onEdit={startEditing}
          onDelete={deleteGoal}
          onCreateFirstGoalClick={focusNewGoalForm}
        />
      </div>

      <form
        onSubmit={handleSaveGoal}
        className="mt-6 rounded-3xl border border-accent-violet/15 bg-accent-violet/[0.04] p-5"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">
              {editingGoalId ? "Edit goal" : "New goal"}
            </p>

            <p className="mt-1 text-xs text-foreground/40">
              Define an outcome and track progress over time
            </p>
          </div>

          {editingGoalId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full border border-muted-border bg-muted px-3 py-1.5 text-xs font-semibold text-foreground/60 transition hover:border-border-strong hover:text-foreground"
            >
              Cancel edit
            </button>
          )}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div>
            <label
              htmlFor="goal-title"
              className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-violet-300"
            >
              Goal title
            </label>

            <input
              ref={titleInputRef}
              id="goal-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Launch Orenios MVP"
              maxLength={140}
              disabled={saving}
              className="h-12 w-full rounded-2xl border border-muted-border bg-muted px-4 text-sm font-medium text-foreground outline-none transition placeholder:text-foreground/30 focus:border-accent-violet/40 focus:ring-4 focus:ring-accent-violet/10 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <div>
            <label
              htmlFor="goal-deadline"
              className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-violet-300"
            >
              Deadline
            </label>

            <input
              id="goal-deadline"
              type="date"
              value={deadline}
              onChange={(event) => setDeadline(event.target.value)}
              disabled={saving}
              className="h-12 w-full rounded-2xl border border-muted-border bg-muted px-4 text-sm text-foreground outline-none transition [color-scheme:dark] focus:border-accent-violet/40 focus:ring-4 focus:ring-accent-violet/10 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
        </div>

        <div className="mt-4">
          <label
            htmlFor="goal-description"
            className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-violet-300"
          >
            Description
          </label>

          <textarea
            id="goal-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What does success look like?"
            maxLength={300}
            rows={3}
            disabled={saving}
            className="w-full resize-none rounded-2xl border border-muted-border bg-muted px-4 py-3 text-sm leading-6 text-foreground outline-none transition placeholder:text-foreground/30 focus:border-accent-violet/40 focus:ring-4 focus:ring-accent-violet/10 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div>
            <div className="flex items-center justify-between gap-4">
              <label
                htmlFor="goal-progress"
                className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-300"
              >
                Progress
              </label>

              <span className="rounded-full bg-surface-strong px-3 py-1 text-xs font-semibold text-foreground/70">
                {progress}%
              </span>
            </div>

            <input
              id="goal-progress"
              type="range"
              min="0"
              max="100"
              step="5"
              value={progress}
              onChange={(event) => {
                const nextProgress = Number(event.target.value);

                setProgress(nextProgress);
                setStatus(
                  getGoalStatusForProgress(nextProgress)
                );
              }}
              disabled={saving}
              className="mt-4 w-full cursor-pointer accent-accent-mint disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label
              htmlFor="goal-status"
              className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-violet-300"
            >
              Status
            </label>

            <select
              id="goal-status"
              value={status}
              onChange={(event) => {
                const nextState = normalizeGoalState({
                  status: event.target.value as GoalStatus,
                  progress,
                });

                setStatus(nextState.status);
                setProgress(nextState.progress);
              }}
              disabled={saving}
              className="h-12 w-full rounded-2xl border border-muted-border bg-muted px-4 text-sm text-foreground outline-none transition focus:border-accent-violet/40 focus:ring-4 focus:ring-accent-violet/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {statusOptions.map((statusOption) => (
                <option
                  key={statusOption}
                  value={statusOption}
                  className="bg-background text-foreground"
                >
                  {statusOption}
                </option>
              ))}
            </select>
          </div>
        </div>

        <motion.button
          whileHover={saving ? undefined : { scale: 1.01 }}
          whileTap={saving ? undefined : { scale: 0.99 }}
          type="submit"
          disabled={saving || !title.trim()}
          className="cta-gradient mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(124,111,240,0.3)] transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Saving...
            </>
          ) : (
            <>
              {editingGoalId ? "Update goal" : "Create goal"}
              <span aria-hidden="true">→</span>
            </>
          )}
        </motion.button>
      </form>
    </section>
  );
}
