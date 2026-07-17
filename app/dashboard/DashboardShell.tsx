"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";import LogoutButton from "./LogoutButton";
import TasksCard from "./TasksCard";
import FocusCard from "./FocusCard";
import GoalsCard from "./GoalsCard";
import CalendarCard from "./CalendarCard";
import NotesCard from "./NotesCard";
import AICoach from "./AICoach";
import { createClient } from "../lib/supabase";

type DashboardShellProps = {
  firstName: string;
  email: string;
};

function getLocalDateString(daysOffset = 0) {
  const now = new Date();
  now.setDate(now.getDate() + daysOffset);

  const timezoneOffset = now.getTimezoneOffset() * 60_000;

  return new Date(now.getTime() - timezoneOffset)
    .toISOString()
    .split("T")[0];
}

const navigationItems = [
  {
    label: "Overview",
    icon: (
      <svg
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M4 13h6V4H4v9Zm0 7h6v-4H4v4Zm10 0h6v-9h-6v9Zm0-16v4h6V4h-6Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: "Tasks",
    icon: (
      <svg
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="m4 7 2 2 4-4M4 15l2 2 4-4M13 7h7M13 15h7"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: "Goals",
    icon: (
      <svg
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="8"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <circle
          cx="12"
          cy="12"
          r="3"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M16.5 7.5 20 4M17 4h3v3"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: "Calendar",
    icon: (
      <svg
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <rect
          x="3.5"
          y="5"
          width="17"
          height="15"
          rx="3"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M8 3v4M16 3v4M3.5 10h17"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    label: "Notes",
    icon: (
      <svg
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M6 3.5h9l3 3V20H6V3.5Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M14.5 3.5V7H18M9 11h6M9 15h6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    label: "AI Coach",
    icon: (
      <svg
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M12 3 13.6 8.4 19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="m18.5 15 .7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export default function DashboardShell({
  firstName,
  email,
}: DashboardShellProps) {
const [activeItem, setActiveItem] = useState("Overview");
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
const [navigationRestored, setNavigationRestored] = useState(false);
const [dailyFocusProgress, setDailyFocusProgress] = useState<number | null>(null);
const [dailyFocusLoaded, setDailyFocusLoaded] = useState(false);

useEffect(() => {
  let cancelled = false;

  async function loadDailyFocusProgress() {
    try {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const { data } = await supabase
        .from("daily_focus")
        .select("progress")
        .eq("user_id", user.id)
        .eq("focus_date", getLocalDateString())
        .maybeSingle();

      if (!cancelled) {
        setDailyFocusProgress(data ? data.progress : null);
      }
    } finally {
      if (!cancelled) {
        setDailyFocusLoaded(true);
      }
    }
  }

  loadDailyFocusProgress();

  return () => {
    cancelled = true;
  };
}, []);

useEffect(() => {
  const timer = window.setTimeout(() => {
    const savedItem = sessionStorage.getItem(
      "orenios-active-dashboard-section"
    );

    const validItems = navigationItems.map((item) => item.label);

    if (savedItem && validItems.includes(savedItem)) {
      setActiveItem(savedItem);
    }

    setNavigationRestored(true);
  }, 0);

  return () => window.clearTimeout(timer);
}, []);

useEffect(() => {
  if (!navigationRestored) {
    return;
  }

  sessionStorage.setItem(
    "orenios-active-dashboard-section",
    activeItem
  );
}, [activeItem, navigationRestored]);
if (!navigationRestored) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-workspace">
      <div className="flex flex-col items-center gap-4">
        <span className="h-7 w-7 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />

        <p className="text-sm font-medium text-gray-400">
          Restoring your workspace...
        </p>
      </div>
    </main>
  );
}
  function selectNavigationItem(item: string) {
    setActiveItem(item);
    setMobileMenuOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <main className="min-h-screen bg-surface-workspace text-gray-950">
      <div className="flex min-h-screen">
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-[278px] border-r border-gray-200/80 bg-white/90 px-5 py-6 backdrop-blur-2xl lg:flex lg:flex-col">
          <SidebarContent
            activeItem={activeItem}
            email={email}
            onSelect={selectNavigationItem}
            dailyProgress={dailyFocusProgress}
            dailyProgressLoaded={dailyFocusLoaded}
          />
        </aside>

        {mobileMenuOpen && (
          <motion.button
            type="button"
            aria-label="Close navigation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          />
        )}

        <motion.aside
          initial={false}
          animate={{
            x: mobileMenuOpen ? 0 : "-100%",
          }}
          transition={{
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="fixed inset-y-0 left-0 z-50 flex w-[285px] flex-col border-r border-gray-200 bg-white px-5 py-6 shadow-2xl lg:hidden"
        >
          <SidebarContent
            activeItem={activeItem}
            email={email}
            onSelect={selectNavigationItem}
            dailyProgress={dailyFocusProgress}
            dailyProgressLoaded={dailyFocusLoaded}
          />
        </motion.aside>

        <section className="min-w-0 flex-1 lg:pl-[278px]">
          <header className="sticky top-0 z-30 border-b border-gray-200/70 bg-surface-workspace/85 px-4 py-3 backdrop-blur-2xl sm:px-6 sm:py-4 lg:px-8">
            <div className="mx-auto max-w-[1500px]">
              {/* Mobile: icon row on top, title on its own full-width row below —
                  a dedicated stacked layout instead of squeezing everything into
                  one row, which was truncating the title behind the icon
                  buttons. */}
              <div className="flex flex-col gap-3 sm:hidden">
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(true)}
                    aria-label="Open navigation"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:bg-gray-50"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M4 7h16M4 12h16M4 17h16"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Notifications"
                      className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:border-gray-300 hover:text-gray-950"
                    >
                      <svg
                        width="19"
                        height="19"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7ZM10 20h4"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>

                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 text-xs font-bold text-white">
                        {firstName.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                    {activeItem === "Overview"
                      ? "Personal workspace"
                      : activeItem}
                  </p>

                  <h1 className="text-xl font-semibold tracking-[-0.025em] text-gray-950">
                    {activeItem === "Overview"
                      ? `Good to see you, ${firstName}.`
                      : getSectionTitle(activeItem)}
                  </h1>
                </div>
              </div>

              {/* Tablet/desktop: original single-row layout, unchanged. */}
              <div className="hidden items-center justify-between gap-4 sm:flex">
                <div className="flex min-w-0 items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(true)}
                    aria-label="Open navigation"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:bg-gray-50 lg:hidden"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M4 7h16M4 12h16M4 17h16"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>

                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                      {activeItem === "Overview"
                        ? "Personal workspace"
                        : activeItem}
                    </p>

                    <h1 className="truncate text-2xl font-semibold tracking-[-0.025em] text-gray-950">
                      {activeItem === "Overview"
                        ? `Good to see you, ${firstName}.`
                        : getSectionTitle(activeItem)}
                    </h1>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-label="Notifications"
                    className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:border-gray-300 hover:text-gray-950"
                  >
                    <svg
                      width="19"
                      height="19"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7ZM10 20h4"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  <div className="flex h-11 items-center gap-3 rounded-2xl border border-gray-200 bg-white px-2 pr-3 shadow-sm">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 text-xs font-bold text-white">
                      {firstName.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <p className="max-w-[150px] truncate text-sm font-semibold text-gray-900">
                        {firstName}
                      </p>

                      <p className="max-w-[150px] truncate text-xs text-gray-400">
                        Personal account
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <motion.div
              key={activeItem}
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.35,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <DashboardContent
                activeItem={activeItem}
                firstName={firstName}
                onNavigate={selectNavigationItem}
              />
            </motion.div>
          </div>
        </section>
      </div>
    </main>
  );
}

function getSectionTitle(activeItem: string) {
  switch (activeItem) {
    case "Tasks":
      return "Organize today’s work.";
    case "Goals":
      return "Turn your plans into progress.";
    case "Calendar":
      return "See what’s coming next.";
    case "Notes":
      return "Keep your thoughts organized.";
    case "AI Coach":
      return "Your intelligent life assistant.";
    default:
      return activeItem;
  }
}

type DashboardContentProps = {
  activeItem: string;
  firstName: string;
  onNavigate: (item: string) => void;
};

function DashboardContent({
  activeItem,
  firstName,
  onNavigate,
}: DashboardContentProps) {
  if (activeItem === "Overview") {
    return (
      <OverviewContent
        firstName={firstName}
        onNavigate={onNavigate}
      />
    );
  }

  if (activeItem === "Tasks") {
    return (
      <SectionPage
        eyebrow="Daily execution"
        title="Tasks"
        description="Capture, complete and securely sync everything that needs your attention."
      >
        <TasksCard />
      </SectionPage>
    );
  }

  if (activeItem === "Goals") {
    return (
      <SectionPage
        eyebrow="Long-term direction"
        title="Goals"
        description="Define meaningful outcomes, set deadlines and keep your progress visible."
      >
        <GoalsCard />
      </SectionPage>
    );
  }

  if (activeItem === "Calendar") {
    return (
      <SectionPage
        eyebrow="Time and schedule"
        title="Calendar"
        description="Organize your events, choose your priorities and keep every important commitment visible."
      >
        <CalendarCard />
      </SectionPage>
    );
  }

  if (activeItem === "Notes") {
    return (
      <SectionPage
        eyebrow="Knowledge and ideas"
        title="Notes"
        description="Capture ideas, organize important information and quickly find everything you want to remember."
      >
        <NotesCard />
      </SectionPage>
    );
  }

  if (activeItem === "AI Coach") {
    return (
      <SectionPage
        eyebrow="Intelligent guidance"
        title="AI Coach"
        description="Get personalized guidance, clear priorities and practical action plans from your Orenios life assistant."
      >
        <AICoach />
      </SectionPage>
    );
  }

  return <ComingSoonContent title={activeItem} />;
}

type SectionPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

function SectionPage({
  eyebrow,
  title,
  description,
  children,
}: SectionPageProps) {
  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-white/80 bg-surface-dark-card px-6 py-7 text-white shadow-[0_30px_80px_rgba(15,23,42,0.15)] sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-16 -top-20 h-64 w-64 rounded-full bg-violet-600/35 blur-[85px]" />
          <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-cyan-500/25 blur-[95px]" />
        </div>

        <div className="relative z-10">
          <p className="text-sm font-medium text-violet-300">
            {eyebrow}
          </p>

          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
            {title}
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/50 sm:text-base">
            {description}
          </p>
        </div>
      </section>

      {children}
    </div>
  );
}

type SidebarContentProps = {
  activeItem: string;
  email: string;
  onSelect: (item: string) => void;
  dailyProgress: number | null;
  dailyProgressLoaded: boolean;
};

function SidebarContent({
  activeItem,
  email,
  onSelect,
  dailyProgress,
  dailyProgressLoaded,
}: SidebarContentProps) {
  const progressLabel =
    !dailyProgressLoaded
      ? "—"
      : dailyProgress === null
        ? "0%"
        : `${dailyProgress}%`;

  const progressWidth =
    dailyProgressLoaded && dailyProgress !== null
      ? `${dailyProgress}%`
      : "0%";

  const progressCaption =
    dailyProgressLoaded && dailyProgress === null
      ? "Set today's focus to start tracking progress."
      : "Complete your key priorities to keep today on track.";
  return (
    <>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => onSelect("Overview")}
          className="flex items-center gap-3 text-left"
          aria-label="Open Orenios overview"
        >
          <motion.div
            animate={{
              y: [0, -4, 0],
              scale: [1, 1.025, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="drop-shadow-[0_0_18px_rgba(124,58,237,0.35)]"
          >
            <Image
              src="/logo2.PNG"
              alt="Orenios AI"
              width={48}
              height={48}
              priority
              className="rounded-full"
            />
          </motion.div>

          <div>
            <p className="text-base font-bold tracking-[-0.02em] text-gray-950">
              Orenios AI
            </p>

            <p className="text-xs text-gray-400">
              Your Life Admin
            </p>
          </div>
        </button>
      </div>

      <nav className="mt-9 space-y-1.5">
        {navigationItems.map((item) => {
          const isActive = activeItem === item.label;

          return (
            <button
              key={item.label}
              type="button"
              onClick={() => onSelect(item.label)}
              className={`group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                isActive
                  ? "bg-gray-950 text-white shadow-[0_12px_30px_rgba(15,23,42,0.18)]"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-950"
              }`}
            >
              <span
                className={
                  isActive
                    ? "text-violet-300"
                    : "text-gray-400 transition group-hover:text-violet-500"
                }
              >
                {item.icon}
              </span>

              <span>{item.label}</span>

              {item.label === "AI Coach" && (
                <span
                  className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                    isActive
                      ? "bg-white/10 text-white/70"
                      : "bg-violet-100 text-violet-600"
                  }`}
                >
                  AI
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-8 rounded-3xl bg-surface-dark-card p-5 text-white shadow-[0_20px_50px_rgba(15,23,42,0.16)]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-white/55">
            Daily progress
          </span>

          <span className="text-xs font-semibold text-violet-300">
            {progressLabel}
          </span>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: progressWidth }}
            transition={{
              duration: 1,
              delay: 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400"
          />
        </div>

        <p className="mt-4 text-xs leading-5 text-white/45">
          {progressCaption}
        </p>
      </div>

      <div className="mt-auto pt-6">
        <div className="mb-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">
            Signed in as
          </p>

          <p className="mt-1 truncate text-xs font-medium text-gray-700">
            {email}
          </p>
        </div>

        <LogoutButton />
      </div>
    </>
  );
}

type OverviewContentProps = {
  firstName: string;
  onNavigate: (item: string) => void;
};

function OverviewContent({
  firstName,
  onNavigate,
}: OverviewContentProps) {
  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-white/80 bg-surface-dark-card px-6 py-7 text-white shadow-[0_30px_80px_rgba(15,23,42,0.15)] sm:px-8 sm:py-9">
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
            className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-semibold text-gray-950 transition hover:scale-[1.02]"
          >
            Plan my day
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </section>

      <section className="grid items-start gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <FocusCard />

        <ProductivityScore />
      </section>

      <TasksCard />

      <div className="flex items-center justify-between gap-4 pt-2">
        <div>
          <p className="text-lg font-semibold tracking-[-0.025em] text-gray-950">
            Your goals
          </p>

          <p className="mt-1 text-sm text-gray-400">
            Keep long-term progress connected to today.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate("Goals")}
          className="flex min-h-[44px] shrink-0 items-center rounded-2xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:text-gray-950"
        >
          Open Goals
        </button>
      </div>

      <GoalsCard />

      <div className="grid gap-6 sm:grid-cols-2">
        <UpcomingEventsCard onNavigate={onNavigate} />
        <AIActionsCard />
      </div>
    </div>
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
          .gte("event_date", getLocalDateString())
          .lte("event_date", getLocalDateString(1));

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

function ProductivityScore() {
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
          .eq("due_date", getLocalDateString());

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
    <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <div>
        <p className="text-sm font-semibold text-gray-950">
          Productivity Score
        </p>

        <p className="mt-1 text-xs text-gray-400">
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
              stroke="#eef2f7"
              strokeWidth="10"
            />

            <motion.circle
              cx="60"
              cy="60"
              r={ringRadius}
              fill="none"
              stroke="url(#productivity-score-ring)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={ringCircumference}
              initial={{ strokeDashoffset: ringCircumference }}
              animate={{ strokeDashoffset: ringOffset }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            />

            <defs>
              <linearGradient
                id="productivity-score-ring"
                x1="0"
                y1="0"
                x2="1"
                y2="1"
              >
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute flex h-[86px] w-[86px] items-center justify-center rounded-full bg-white">
            <div className="text-center">
              <p className="text-2xl font-bold tracking-[-0.04em] text-gray-950">
                {loading ? "—" : score === null ? "—" : score}
              </p>

              <p className="text-[10px] uppercase tracking-[0.12em] text-gray-400">
                Score
              </p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-900">
            {loading ? "Loading..." : momentumLabel}
          </p>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            {loading ? "Checking today's tasks..." : momentumDescription}
          </p>
        </div>
      </div>
    </div>
  );
}

function AIActionsCard() {
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

        const since7 = getLocalDateString(-7);
        const since30 = getLocalDateString(-30);

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
    <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-950">
            AI actions taken
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Real changes AI made in your workspace
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 text-white shadow-[0_8px_20px_rgba(124,58,237,0.35)]">
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
          <p className="text-3xl font-semibold tracking-[-0.05em] text-gray-950">
            {loading ? "—" : counts.last7}
          </p>

          <p className="mt-1 text-xs text-gray-400">Last 7 days</p>
        </div>

        <div>
          <p className="text-3xl font-semibold tracking-[-0.05em] text-gray-950">
            {loading ? "—" : counts.last30}
          </p>

          <p className="mt-1 text-xs text-gray-400">Last 30 days</p>
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-gray-400">
        Tasks created, goals updated, deadlines moved — every real
        change Orenios made for you, not just messages sent.
      </p>
    </div>
  );
}

type DashboardCardProps = {
  title: string;
  value: string;
  description: string;
  accent: string;
};

function DashboardCard({
  title,
  value,
  description,
  accent,
}: DashboardCardProps) {
  return (
    <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.05)] transition hover:border-gray-300 hover:shadow-[0_22px_60px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {title}
          </p>

          <p className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-gray-950">
            {value}
          </p>

          <p className="mt-2 text-sm text-gray-400">
            {description}
          </p>
        </div>

        <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-500">
          {accent}
        </span>
      </div>
    </div>
  );
}

function ComingSoonContent({ title }: { title: string }) {
  return (
    <div className="flex min-h-[65vh] items-center justify-center">
      <div className="w-full max-w-xl rounded-3xl border border-gray-200/80 bg-white p-10 text-center shadow-[0_25px_70px_rgba(15,23,42,0.08)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
          <span className="text-xl">✦</span>
        </div>

        <h2 className="mt-6 text-3xl font-semibold tracking-[-0.04em] text-gray-950">
          {title} is coming next.
        </h2>

        <p className="mt-4 text-sm leading-6 text-gray-500">
          This section is already part of the Orenios workspace and will be
          connected to real user data as we build the product.
        </p>
      </div>
    </div>
  );
}