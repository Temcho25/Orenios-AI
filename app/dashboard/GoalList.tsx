"use client";

import { AnimatePresence, motion } from "framer-motion";
import { formatDeadline, getStatusClasses } from "./lib/goal-helpers";
import type { Goal } from "./GoalsCard";

type GoalListProps = {
  goals: Goal[];
  loadingGoals: boolean;
  pendingGoalIds: string[];
  onEdit: (goal: Goal) => void;
  onDelete: (goal: Goal) => void;
  onCreateFirstGoalClick: () => void;
};

export default function GoalList({
  goals,
  loadingGoals,
  pendingGoalIds,
  onEdit,
  onDelete,
  onCreateFirstGoalClick,
}: GoalListProps) {
  if (loadingGoals) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        {[1, 2].map((item) => (
          <div
            key={item}
            className="animate-pulse rounded-3xl border border-card-border bg-card p-5"
          >
            <div className="h-4 w-24 rounded-full bg-surface-strong" />
            <div className="mt-4 h-6 w-3/4 rounded-full bg-surface-strong" />
            <div className="mt-3 h-4 w-full rounded-full bg-muted" />
            <div className="mt-2 h-4 w-2/3 rounded-full bg-muted" />
            <div className="mt-6 h-2 w-full rounded-full bg-surface-strong" />
          </div>
        ))}
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-muted-border bg-card px-6 py-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-violet/15 text-accent-violet">
          <span className="text-xl">◎</span>
        </div>

        <p className="mt-4 text-sm font-semibold text-foreground/80">
          You don&apos;t have any goals yet.
        </p>

        <p className="mt-2 text-sm leading-6 text-foreground/40">
          Create your first goal, or ask the AI Coach to build
          one from what you tell it.
        </p>

        <button
          type="button"
          onClick={onCreateFirstGoalClick}
          className="mt-5 rounded-2xl border border-muted-border bg-muted px-5 py-3 text-sm font-semibold text-foreground transition hover:border-border-strong hover:bg-surface-strong"
        >
          Create your first goal
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <AnimatePresence initial={false}>
        {goals.map((goal) => {
          const goalPending = pendingGoalIds.includes(goal.id);

          return (
            <motion.article
              key={goal.id}
              layout
              initial={{ opacity: 0, y: 10, scale: 0.99 }}
              animate={{
                opacity: goalPending ? 0.6 : 1,
                y: 0,
                scale: 1,
              }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{
                duration: 0.25,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="rounded-3xl border border-card-border bg-card p-5 backdrop-blur-[12px] transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-violet/25 hover:bg-muted hover:shadow-[0_20px_45px_-15px_rgba(124,111,240,0.35)]"
            >
              <div className="flex items-start justify-between gap-4">
                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusClasses(
                    goal.status
                  )}`}
                >
                  {goal.status}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(goal)}
                    disabled={goalPending}
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-foreground/30 transition hover:bg-accent-violet/15 hover:text-accent-violet disabled:cursor-wait disabled:opacity-50"
                    aria-label={`Edit "${goal.title}"`}
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
                    onClick={() => onDelete(goal)}
                    disabled={goalPending}
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-foreground/25 transition hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 disabled:cursor-wait"
                    aria-label={`Delete "${goal.title}"`}
                  >
                    {goalPending ? (
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

              <h3 className="mt-4 text-xl font-semibold tracking-[-0.025em] text-foreground">
                {goal.title}
              </h3>

              {goal.description && (
                <p className="mt-3 text-sm leading-6 text-foreground/50">
                  {goal.description}
                </p>
              )}

              <div className="mt-5">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-medium uppercase tracking-[0.14em] text-foreground/40">
                    Progress
                  </span>

                  <span className="text-xs font-semibold text-foreground/60">
                    {goal.progress}%
                  </span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-strong">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.progress}%` }}
                    transition={{
                      duration: 0.5,
                      ease: "easeOut",
                    }}
                    className="h-full rounded-full bg-accent-mint"
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-card-border pt-4">
                <p className="text-xs text-foreground/40">Deadline</p>

                <p className="text-xs font-semibold text-foreground/70">
                  {formatDeadline(goal.deadline)}
                </p>
              </div>
            </motion.article>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
