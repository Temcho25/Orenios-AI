"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase";

type SummaryGoal = {
  id: string;
  title: string;
  progress: number;
  status: "Not Started" | "In Progress" | "Completed";
};

export default function GoalsSummaryCard({
  onNavigate,
}: {
  onNavigate: (item: string) => void;
}) {
  const [goals, setGoals] = useState<SummaryGoal[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadGoals() {
      try {
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          return;
        }

        const { data } = await supabase
          .from("goals")
          .select("id, title, progress, status")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (!cancelled) {
          setGoals((data ?? []) as SummaryGoal[]);
        }
      } catch {
        if (!cancelled) {
          setGoals([]);
        }
      }
    }

    loadGoals();

    return () => {
      cancelled = true;
    };
  }, []);

  const loading = goals === null;
  const activeGoals = (goals ?? []).filter(
    (goal) => goal.status !== "Completed"
  );
  const topGoals = activeGoals.slice(0, 3);

  return (
    <div className="min-w-0 rounded-3xl border border-card-border bg-card p-6 backdrop-blur-[12px]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-foreground">Goals</p>

          <p className="mt-1 text-xs text-foreground/40">
            {loading ? "Loading..." : `${activeGoals.length} in progress`}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate("Goals")}
          className="flex min-h-[44px] shrink-0 items-center rounded-2xl border border-muted-border bg-muted px-4 text-sm font-semibold text-foreground/70 backdrop-blur-md transition hover:border-border-strong hover:text-foreground"
        >
          View all
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-14 animate-pulse rounded-2xl bg-muted"
              />
            ))}
          </div>
        ) : topGoals.length > 0 ? (
          topGoals.map((goal) => (
            <div
              key={goal.id}
              className="rounded-2xl border border-card-border bg-muted px-4 py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="min-w-0 truncate text-sm font-medium text-foreground">
                  {goal.title}
                </p>

                <span className="shrink-0 text-xs font-semibold text-foreground/50">
                  {goal.progress}%
                </span>
              </div>

              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-strong">
                <div
                  className="h-full rounded-full bg-accent-mint"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
            </div>
          ))
        ) : (
          <p className="rounded-2xl border border-dashed border-muted-border bg-muted px-4 py-6 text-center text-sm text-foreground/40">
            No active goals yet.
          </p>
        )}
      </div>
    </div>
  );
}
