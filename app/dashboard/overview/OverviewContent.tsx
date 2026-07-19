"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase";
import { getLocalDateKey } from "../../lib/date-utils";
import FocusCard from "../FocusCard";
import ProductivityScore from "./ProductivityScore";
import AIActionsCard from "./AIActionsCard";
import TasksSummaryCard from "./TasksSummaryCard";
import GoalsSummaryCard from "./GoalsSummaryCard";
import DashboardCard from "./DashboardCard";

type OverviewContentProps = {
  firstName: string;
  onNavigate: (item: string) => void;
};

const overviewStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const overviewItem = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function OverviewContent({
  firstName,
  onNavigate,
}: OverviewContentProps) {
  return (
    <motion.div
      className="space-y-6"
      variants={overviewStagger}
      initial="hidden"
      animate="visible"
    >
      <motion.section
        variants={overviewItem}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-surface-dark-card px-6 py-7 text-white shadow-[0_30px_80px_rgba(0,0,0,0.3)] sm:px-8 sm:py-9"
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-16 -top-20 h-64 w-64 rounded-full bg-violet-600/35 blur-[85px]" />
          <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-cyan-500/25 blur-[95px]" />
        </div>

        <div className="relative z-10 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-violet-300">
              Your day, clearly organized
            </p>

            <h2 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">
              Let&apos;s make today count, {firstName}.
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-6 text-white/50 sm:text-base">
              Orenios keeps your priorities, tasks and goals together so you
              always know what deserves your attention next.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate("AI Coach")}
            className="cta-gradient flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(124,111,240,0.35)] transition hover:scale-[1.02]"
          >
            Plan my day
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </motion.section>

      <motion.section
        variants={overviewItem}
        className="grid items-start gap-6 xl:grid-cols-[1.15fr_0.85fr]"
      >
        <FocusCard />

        <ProductivityScore />
      </motion.section>

      <motion.div
        variants={overviewItem}
        className="grid items-start gap-6 xl:grid-cols-2"
      >
        <TasksSummaryCard onNavigate={onNavigate} />
        <GoalsSummaryCard onNavigate={onNavigate} />
      </motion.div>

      <motion.div variants={overviewItem} className="grid gap-6 sm:grid-cols-2">
        <UpcomingEventsCard onNavigate={onNavigate} />
        <AIActionsCard />
      </motion.div>
    </motion.div>
  );
}

function isWithinNext24Hours(
  event: { event_date: string; start_time: string | null },
  now: Date
) {
  const eventDateTime = new Date(
    event.start_time
      ? `${event.event_date}T${event.start_time}`
      : `${event.event_date}T00:00:00`
  );

  const diffMs = eventDateTime.getTime() - now.getTime();

  return diffMs >= 0 && diffMs <= 24 * 60 * 60 * 1000;
}

function UpcomingEventsCard({
  onNavigate,
}: {
  onNavigate: (item: string) => void;
}) {
  const [events, setEvents] = useState<
    { event_date: string; start_time: string | null }[] | null
  >(null);

  useEffect(() => {
    let cancelled = false;

    async function loadUpcomingEvents() {
      try {
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          return;
        }

        const { data } = await supabase
          .from("calendar_events")
          .select("event_date, start_time")
          .eq("user_id", user.id)
          .gte("event_date", getLocalDateKey())
          .lte("event_date", getLocalDateKey(new Date(), 1));

        if (!cancelled) {
          setEvents(data ?? []);
        }
      } catch {
        if (!cancelled) {
          setEvents([]);
        }
      }
    }

    loadUpcomingEvents();

    return () => {
      cancelled = true;
    };
  }, []);

  const upcomingCount =
    events === null
      ? null
      : events.filter((event) => isWithinNext24Hours(event, new Date()))
          .length;

  return (
    <button
      type="button"
      onClick={() => onNavigate("Calendar")}
      className="w-full text-left"
    >
      <DashboardCard
        title="Upcoming"
        value={upcomingCount === null ? "—" : String(upcomingCount)}
        description="Events in the next 24 hours"
        accent="View calendar"
      />
    </button>
  );
}
