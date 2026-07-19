"use client";

import { motion } from "framer-motion";
import {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createClient } from "../lib/supabase";
import { getLocalDateKey } from "../lib/date-utils";
import { type TaskPriority } from "../lib/task-priority";
import TaskList from "./TaskList";

export type Task = {
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

  const today = getLocalDateKey();

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
    <section className="rounded-3xl border border-card-border bg-card p-6 backdrop-blur-[12px]">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Today&apos;s Tasks
          </p>

          <p className="mt-1 text-xs text-foreground/40">
            Prioritize your work and keep deadlines visible
          </p>
        </div>

        <div className="rounded-full bg-accent-violet/15 px-3 py-1.5 text-xs font-semibold text-accent-violet">
          {completedCount} of {tasks.length} completed
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-foreground/40">
            Daily progress
          </p>

          <span className="text-xs font-semibold text-foreground/50">
            {progress}%
          </span>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-strong">
          <motion.div
            animate={{
              width: `${progress}%`,
            }}
            transition={{
              duration: 0.5,
              ease: "easeOut",
            }}
            className="h-full rounded-full bg-accent-mint"
          />
        </div>
      </div>

      <form
        onSubmit={handleAddTask}
        className="mt-6 rounded-3xl border border-card-border bg-card p-4"
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
          className="h-12 w-full rounded-2xl border border-muted-border bg-muted px-4 text-sm text-foreground outline-none transition placeholder:text-foreground/30 focus:border-accent-violet/40 focus:ring-4 focus:ring-accent-violet/10 disabled:cursor-not-allowed disabled:opacity-60"
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
            className="h-12 rounded-2xl border border-muted-border bg-muted px-4 text-sm text-foreground outline-none transition focus:border-accent-violet/40 focus:ring-4 focus:ring-accent-violet/10 disabled:opacity-60"
          >
            {priorityOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="bg-background text-foreground"
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
            className="h-12 rounded-2xl border border-muted-border bg-muted px-4 text-sm text-foreground outline-none transition [color-scheme:dark] focus:border-accent-violet/40 focus:ring-4 focus:ring-accent-violet/10 disabled:opacity-60"
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
            className="cta-gradient flex h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(124,111,240,0.3)] transition disabled:cursor-not-allowed disabled:opacity-60"
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
          className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
        >
          {errorMessage}
        </motion.div>
      )}

      <TaskList
        tasks={tasks}
        loadingTasks={loadingTasks}
        pendingTaskIds={pendingTaskIds}
        today={today}
        onToggle={toggleTask}
        onDelete={deleteTask}
        onAddFirstTaskClick={() => newTaskInputRef.current?.focus()}
      />
    </section>
  );
}
