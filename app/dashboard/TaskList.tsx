"use client";

import { AnimatePresence, motion } from "framer-motion";
import { getTaskPriorityClasses } from "../lib/task-priority";
import type { Task } from "./TasksCard";

function formatDueDate(date: string | null) {
  if (!date) {
    return "No deadline";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

type TaskListProps = {
  tasks: Task[];
  loadingTasks: boolean;
  pendingTaskIds: string[];
  today: string;
  onToggle: (task: Task) => void;
  onDelete: (task: Task) => void;
  onAddFirstTaskClick: () => void;
};

export default function TaskList({
  tasks,
  loadingTasks,
  pendingTaskIds,
  today,
  onToggle,
  onDelete,
  onAddFirstTaskClick,
}: TaskListProps) {
  return (
    <div className="mt-6 space-y-3">
      {loadingTasks ? (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="flex animate-pulse items-center gap-3 rounded-2xl border border-card-border bg-card px-4 py-4"
            >
              <div className="h-6 w-6 rounded-lg bg-surface-strong" />
              <div className="h-4 flex-1 rounded-full bg-surface-strong" />
            </div>
          ))}
        </div>
      ) : (
        <AnimatePresence initial={false}>
          {tasks.map((task) => {
            const taskPending = pendingTaskIds.includes(task.id);

            const isOverdue =
              Boolean(task.due_date) &&
              !task.completed &&
              task.due_date! < today;

            return (
              <motion.div
                key={task.id}
                layout
                initial={{
                  opacity: 0,
                  y: 8,
                  scale: 0.99,
                }}
                animate={{
                  opacity: taskPending ? 0.65 : 1,
                  y: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  y: -8,
                  scale: 0.98,
                }}
                transition={{
                  duration: 0.25,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`group rounded-2xl border px-4 py-4 backdrop-blur-[12px] transition-all duration-300 ${
                  task.completed
                    ? "border-accent-mint/20 bg-accent-mint/[0.06]"
                    : isOverdue
                      ? "border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/[0.06]"
                      : "border-card-border bg-card hover:-translate-y-0.5 hover:border-accent-violet/25 hover:bg-muted hover:shadow-[0_20px_45px_-15px_rgba(124,111,240,0.35)]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => onToggle(task)}
                    disabled={taskPending}
                    aria-label={
                      task.completed
                        ? `Mark "${task.title}" as incomplete`
                        : `Mark "${task.title}" as complete`
                    }
                    className="group/check -m-2.5 flex shrink-0 items-center justify-center p-2.5 disabled:cursor-wait"
                  >
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-lg border transition ${
                        task.completed
                          ? "border-accent-mint bg-accent-mint text-white"
                          : "border-border-strong bg-muted text-transparent group-hover/check:border-accent-violet"
                      }`}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="m5 12 4 4L19 6"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm leading-6 transition ${
                        task.completed
                          ? "text-foreground/30 line-through"
                          : "text-foreground/80"
                      }`}
                    >
                      {task.title}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${getTaskPriorityClasses(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                          isOverdue
                            ? "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300"
                            : "bg-surface-strong text-foreground/50"
                        }`}
                      >
                        {isOverdue
                          ? `Overdue · ${formatDueDate(task.due_date)}`
                          : formatDueDate(task.due_date)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDelete(task)}
                    disabled={taskPending}
                    aria-label={`Delete "${task.title}"`}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-foreground/25 opacity-100 transition hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 disabled:cursor-wait sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    {taskPending ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-border-strong border-t-foreground/60" />
                    ) : (
                      <svg
                        width="17"
                        height="17"
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
              </motion.div>
            );
          })}
        </AnimatePresence>
      )}

      {!loadingTasks && tasks.length === 0 && (
        <motion.div
          initial={{
            opacity: 0,
            y: 8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="rounded-3xl border border-dashed border-muted-border bg-card px-6 py-10 text-center"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-violet/15 text-accent-violet">
            <span className="text-xl">✓</span>
          </div>

          <p className="mt-4 text-sm font-semibold text-foreground/80">
            You don&apos;t have any tasks yet.
          </p>

          <p className="mt-2 text-sm leading-6 text-foreground/40">
            Add your first task, or ask the AI Coach to turn a goal
            into a plan for you.
          </p>

          <button
            type="button"
            onClick={onAddFirstTaskClick}
            className="mt-5 rounded-2xl border border-muted-border bg-muted px-5 py-3 text-sm font-semibold text-foreground transition hover:border-border-strong hover:bg-surface-strong"
          >
            Add your first task
          </button>
        </motion.div>
      )}
    </div>
  );
}
