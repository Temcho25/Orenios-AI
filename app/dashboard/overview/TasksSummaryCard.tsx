"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase";
import {
  getTaskPriorityClasses,
  type TaskPriority,
} from "../../lib/task-priority";

type SummaryTask = {
  id: string;
  title: string;
  completed: boolean;
  priority: TaskPriority;
  due_date: string | null;
};

export default function TasksSummaryCard({
  onNavigate,
}: {
  onNavigate: (item: string) => void;
}) {
  const [tasks, setTasks] = useState<SummaryTask[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadTasks() {
      try {
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          return;
        }

        const { data } = await supabase
          .from("tasks")
          .select("id, title, completed, priority, due_date")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (!cancelled) {
          setTasks((data ?? []) as SummaryTask[]);
        }
      } catch {
        if (!cancelled) {
          setTasks([]);
        }
      }
    }

    loadTasks();

    return () => {
      cancelled = true;
    };
  }, []);

  const loading = tasks === null;
  const openTasks = (tasks ?? []).filter((task) => !task.completed);

  const priorityRank: Record<SummaryTask["priority"], number> = {
    high: 0,
    medium: 1,
    low: 2,
  };

  const topTasks = [...openTasks]
    .sort((a, b) => {
      if (a.due_date && !b.due_date) return -1;
      if (!a.due_date && b.due_date) return 1;

      if (a.due_date && b.due_date && a.due_date !== b.due_date) {
        return a.due_date < b.due_date ? -1 : 1;
      }

      return priorityRank[a.priority] - priorityRank[b.priority];
    })
    .slice(0, 3);

  return (
    <div className="min-w-0 rounded-3xl border border-card-border bg-card p-6 backdrop-blur-[12px]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-foreground">Tasks</p>

          <p className="mt-1 text-xs text-foreground/40">
            {loading ? "Loading..." : `${openTasks.length} open`}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate("Tasks")}
          className="flex min-h-[44px] shrink-0 items-center rounded-2xl border border-muted-border bg-muted px-4 text-sm font-semibold text-foreground/70 backdrop-blur-md transition hover:border-border-strong hover:text-foreground"
        >
          View all
        </button>
      </div>

      <div className="mt-5 space-y-2">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-14 animate-pulse rounded-2xl bg-muted"
              />
            ))}
          </div>
        ) : topTasks.length > 0 ? (
          topTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-card-border bg-muted px-4 py-3"
            >
              <p className="min-w-0 truncate text-sm font-medium text-foreground">
                {task.title}
              </p>

              <span
                className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${getTaskPriorityClasses(
                  task.priority
                )}`}
              >
                {task.priority}
              </span>
            </div>
          ))
        ) : (
          <p className="rounded-2xl border border-dashed border-muted-border bg-muted px-4 py-6 text-center text-sm text-foreground/40">
            No open tasks — nice work.
          </p>
        )}
      </div>
    </div>
  );
}
