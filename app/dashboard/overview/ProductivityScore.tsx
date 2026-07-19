"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase";
import { getLocalDateKey } from "../../lib/date-utils";

export default function ProductivityScore() {
  const [tasksToday, setTasksToday] = useState<
    { completed: boolean }[] | null
  >(null);

  useEffect(() => {
    let cancelled = false;

    async function loadTasksToday() {
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
          .select("completed")
          .eq("user_id", user.id)
          .eq("due_date", getLocalDateKey());

        if (!cancelled) {
          setTasksToday(data ?? []);
        }
      } catch {
        if (!cancelled) {
          setTasksToday([]);
        }
      }
    }

    loadTasksToday();

    return () => {
      cancelled = true;
    };
  }, []);

  const loading = tasksToday === null;
  const totalToday = tasksToday?.length ?? 0;
  const completedToday =
    tasksToday?.filter((task) => task.completed).length ?? 0;
  const score =
    totalToday === 0 ? null : Math.round((completedToday / totalToday) * 100);

  const ringRadius = 50;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset =
    score === null
      ? ringCircumference
      : ringCircumference * (1 - score / 100);

  const momentumLabel =
    score === null
      ? "No tasks due today"
      : score >= 70
        ? "Strong momentum"
        : score >= 35
          ? "Steady pace"
          : "Just getting started";

  const momentumDescription =
    score === null
      ? "Add a task with today's date to start tracking your score."
      : `${completedToday} of ${totalToday} tasks due today are done.`;

  return (
    <div className="rounded-3xl border border-card-border bg-card p-6 backdrop-blur-[12px] transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-violet/25 hover:shadow-[0_20px_45px_-15px_rgba(124,111,240,0.35)]">
      <div>
        <p className="text-sm font-semibold text-foreground">
          Productivity Score
        </p>

        <p className="mt-1 text-xs text-foreground/40">
          Based on today&apos;s activity
        </p>
      </div>

      <div className="mt-7 flex items-center gap-6">
        <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">
          <svg viewBox="0 0 120 120" className="h-28 w-28 -rotate-90">
            <circle
              cx="60"
              cy="60"
              r={ringRadius}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="10"
            />

            <motion.circle
              cx="60"
              cy="60"
              r={ringRadius}
              fill="none"
              stroke="#3ecf8e"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={ringCircumference}
              initial={{ strokeDashoffset: ringCircumference }}
              animate={{ strokeDashoffset: ringOffset }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </svg>

          <div className="absolute flex h-[86px] w-[86px] items-center justify-center rounded-full bg-background">
            <div className="text-center">
              <p className="text-2xl font-bold tracking-[-0.04em] text-foreground">
                {loading ? "—" : score === null ? "—" : score}
              </p>

              <p className="text-[10px] uppercase tracking-[0.12em] text-foreground/40">
                Score
              </p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground/90">
            {loading ? "Loading..." : momentumLabel}
          </p>

          <p className="mt-2 text-sm leading-6 text-foreground/50">
            {loading ? "Checking today's tasks..." : momentumDescription}
          </p>
        </div>
      </div>
    </div>
  );
}
