"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createClient } from "../lib/supabase";

type TaskPriority = "low" | "medium" | "high";

type Task = {
  id: string;
  title: string;
  completed: boolean;
  priority: TaskPriority;
  due_date: string | null;
  created_at: string;
};

const priorityOptions: {
  value: TaskPriority;
  label: string;
}[] = [
  {
    value: "low",
    label: "Low",
  },
  {
    value: "medium",
    label: "Medium",
  },
  {
    value: "high",
    label: "High",
  },
];

function getTodayDateKey() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

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

function getPriorityClasses(priority: TaskPriority) {
  switch (priority) {
    case "high":
      return "border-red-100 bg-red-50 text-red-600";
    case "low":
      return "border-blue-100 bg-blue-50 text-blue-600";
    default:
      return "border-amber-100 bg-amber-50 text-amber-600";
  }
}

export default function TasksCard() {
  const newTaskInputRef = useRef<HTMLInputElement>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [priority, setPriority] =
    useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState("");

  const [loadingTasks, setLoadingTasks] = useState(true);
  const [addingTask, setAddingTask] = useState(false);
  const [pendingTaskIds, setPendingTaskIds] = useState<
    string[]
  >([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadTasks() {
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
          .from("tasks")
          .select(
            "id, title, completed, priority, due_date, created_at"
          )
          .eq("user_id", user.id)
          .order("completed", {
            ascending: true,
          })
          .order("due_date", {
            ascending: true,
            nullsFirst: false,
          })
          .order("created_at", {
            ascending: true,
          });

        if (error) {
          throw error;
        }

        if (!cancelled) {
          setTasks((data ?? []) as Task[]);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Could not load your tasks."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingTasks(false);
        }
      }
    }

    void loadTasks();

    return () => {
      cancelled = true;
    };
  }, []);

  const completedCount = useMemo(
    () => tasks.filter((task) => task.completed).length,
    [tasks]
  );

  const progress =
    tasks.length === 0
      ? 0
      : Math.round((completedCount / tasks.length) * 100);

  const today = getTodayDateKey();

  function setTaskPending(
    taskId: string,
    pending: boolean
  ) {
    setPendingTaskIds((currentIds) =>
      pending
        ? [...currentIds, taskId]
        : currentIds.filter((id) => id !== taskId)
    );
  }

  async function handleAddTask(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const normalizedTask = newTask.trim();

    if (!normalizedTask || addingTask) {
      return;
    }

    setErrorMessage("");
    setAddingTask(true);

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
        .from("tasks")
        .insert({
          user_id: user.id,
          title: normalizedTask,
          completed: false,
          priority,
          due_date: dueDate || null,
        })
        .select(
          "id, title, completed, priority, due_date, created_at"
        )
        .single();

      if (error) {
        throw error;
      }

      setTasks((currentTasks) => [
        ...currentTasks,
        data as Task,
      ]);

      setNewTask("");
      setPriority("medium");
      setDueDate("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not add the task."
      );
    } finally {
      setAddingTask(false);
    }
  }

  async function toggleTask(task: Task) {
    if (pendingTaskIds.includes(task.id)) {
      return;
    }

    const previousCompleted = task.completed;
    const nextCompleted = !previousCompleted;

    setErrorMessage("");
    setTaskPending(task.id, true);

    setTasks((currentTasks) =>
      currentTasks.map((currentTask) =>
        currentTask.id === task.id
          ? {
              ...currentTask,
              completed: nextCompleted,
            }
          : currentTask
      )
    );

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
        .from("tasks")
        .update({
          completed: nextCompleted,
        })
        .eq("id", task.id)
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }
    } catch (error) {
      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask.id === task.id
            ? {
                ...currentTask,
                completed: previousCompleted,
              }
            : currentTask
        )
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not update the task."
      );
    } finally {
      setTaskPending(task.id, false);
    }
  }

  async function deleteTask(task: Task) {
    if (pendingTaskIds.includes(task.id)) {
      return;
    }

    setErrorMessage("");
    setTaskPending(task.id, true);

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
        .from("tasks")
        .delete()
        .eq("id", task.id)
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      setTasks((currentTasks) =>
        currentTasks.filter(
          (currentTask) => currentTask.id !== task.id
        )
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not delete the task."
      );
    } finally {
      setTaskPending(task.id, false);
    }
  }

  return (
    <section className="rounded-[28px] border border-gray-200/80 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-950">
            Today&apos;s Tasks
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Prioritize your work and keep deadlines visible
          </p>
        </div>

        <div className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-600">
          {completedCount} of {tasks.length} completed
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-gray-400">
            Daily progress
          </p>

          <span className="text-xs font-semibold text-gray-500">
            {progress}%
          </span>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
          <motion.div
            animate={{
              width: `${progress}%`,
            }}
            transition={{
              duration: 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
          />
        </div>
      </div>

      <form
        onSubmit={handleAddTask}
        className="mt-6 rounded-[24px] border border-gray-200 bg-gray-50 p-4"
      >
        <input
          ref={newTaskInputRef}
          type="text"
          value={newTask}
          onChange={(event) =>
            setNewTask(event.target.value)
          }
          placeholder="Add a task..."
          maxLength={120}
          disabled={addingTask}
          className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
        />

        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <select
            value={priority}
            onChange={(event) =>
              setPriority(
                event.target.value as TaskPriority
              )
            }
            disabled={addingTask}
            className="h-12 rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-950 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100 disabled:opacity-60"
          >
            {priorityOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label} priority
              </option>
            ))}
          </select>

          <input
            type="date"
            value={dueDate}
            onChange={(event) =>
              setDueDate(event.target.value)
            }
            disabled={addingTask}
            className="h-12 rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-950 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100 disabled:opacity-60"
          />

          <motion.button
            whileHover={
              addingTask ? undefined : { scale: 1.02 }
            }
            whileTap={
              addingTask ? undefined : { scale: 0.98 }
            }
            type="submit"
            disabled={addingTask || !newTask.trim()}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-gray-950 px-5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(15,23,42,0.16)] transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {addingTask ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Adding...
              </>
            ) : (
              <>
                Add task
                <span aria-hidden="true">+</span>
              </>
            )}
          </motion.button>
        </div>
      </form>

      {errorMessage && (
        <motion.div
          initial={{
            opacity: 0,
            y: -5,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          role="alert"
          className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
        >
          {errorMessage}
        </motion.div>
      )}

      <div className="mt-6 space-y-3">
        {loadingTasks ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex animate-pulse items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4"
              >
                <div className="h-6 w-6 rounded-lg bg-gray-200" />
                <div className="h-4 flex-1 rounded-full bg-gray-200" />
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {tasks.map((task) => {
              const taskPending =
                pendingTaskIds.includes(task.id);

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
                  className={`group rounded-2xl border px-4 py-4 transition ${
                    task.completed
                      ? "border-emerald-100 bg-emerald-50/60"
                      : isOverdue
                        ? "border-red-200 bg-red-50/60"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => toggleTask(task)}
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
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-gray-300 bg-white text-transparent group-hover/check:border-violet-400"
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
                            ? "text-gray-400 line-through"
                            : "text-gray-700"
                        }`}
                      >
                        {task.title}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${getPriorityClasses(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                            isOverdue
                              ? "bg-red-100 text-red-600"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {isOverdue
                            ? `Overdue · ${formatDueDate(
                                task.due_date
                              )}`
                            : formatDueDate(task.due_date)}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteTask(task)}
                      disabled={taskPending}
                      aria-label={`Delete "${task.title}"`}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-gray-300 opacity-100 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-wait sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      {taskPending ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
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
            className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-violet-500 shadow-sm">
              <span className="text-xl">✓</span>
            </div>

            <p className="mt-4 text-sm font-semibold text-gray-800">
              You don&apos;t have any tasks yet.
            </p>

            <p className="mt-2 text-sm leading-6 text-gray-400">
              Add your first task, or ask the AI Coach to turn a goal
              into a plan for you.
            </p>

            <button
              type="button"
              onClick={() => newTaskInputRef.current?.focus()}
              className="mt-5 rounded-2xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-black"
            >
              Add your first task
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
