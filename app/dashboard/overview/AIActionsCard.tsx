"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase";
import { getLocalDateKey } from "../../lib/date-utils";

export default function AIActionsCard() {
  const [counts, setCounts] = useState<{
    last7: number;
    last30: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadActionCounts() {
      try {
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          return;
        }

        const since7 = getLocalDateKey(new Date(), -7);
        const since30 = getLocalDateKey(new Date(), -30);

        const { data } = await supabase
          .from("ai_messages")
          .select("created_at")
          .eq("user_id", user.id)
          .eq("role", "assistant")
          .not("action", "is", null)
          .gte("created_at", `${since30}T00:00:00`);

        if (!cancelled) {
          const rows = data ?? [];
          const last7 = rows.filter(
            (row) => row.created_at >= `${since7}T00:00:00`
          ).length;

          setCounts({ last7, last30: rows.length });
        }
      } catch {
        if (!cancelled) {
          setCounts({ last7: 0, last30: 0 });
        }
      }
    }

    loadActionCounts();

    return () => {
      cancelled = true;
    };
  }, []);

  const loading = counts === null;

  return (
    <div className="rounded-3xl border border-card-border bg-card p-6 backdrop-blur-[12px] transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-violet/25 hover:shadow-[0_20px_45px_-15px_rgba(124,111,240,0.35)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-foreground">
            AI actions taken
          </p>

          <p className="mt-1 text-xs text-foreground/40">
            Real changes AI made in your workspace
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent-violet/15 text-accent-violet">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M13 3 4 14h6l-1 7 9-11h-6l1-7Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div>
          <p className="text-3xl font-semibold tracking-[-0.05em] text-foreground">
            {loading ? "—" : counts.last7}
          </p>

          <p className="mt-1 text-xs text-foreground/40">Last 7 days</p>
        </div>

        <div>
          <p className="text-3xl font-semibold tracking-[-0.05em] text-foreground">
            {loading ? "—" : counts.last30}
          </p>

          <p className="mt-1 text-xs text-foreground/40">Last 30 days</p>
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-foreground/40">
        Tasks created, goals updated, deadlines moved — every real
        change Orenios made for you, not just messages sent.
      </p>
    </div>
  );
}
