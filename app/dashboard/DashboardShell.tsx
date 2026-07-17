"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";import LogoutButton from "./LogoutButton";
import AnimatedLogo from "../components/v2/AnimatedLogo";
import ThemeToggle from "./ThemeToggle";
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
    <main className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <span className="h-7 w-7 animate-spin rounded-full border-2 border-muted-border border-t-accent-violet" />

        <p className="text-sm font-medium text-foreground/40">
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
    <main className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-[278px] border-r border-card-border bg-background/80 px-5 py-6 backdrop-blur-2xl lg:flex lg:flex-col">
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
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
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
          className="fixed inset-y-0 left-0 z-50 flex w-[285px] flex-col border-r border-card-border bg-background px-5 py-6 shadow-2xl lg:hidden"
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
          <header className="sticky top-0 z-30 border-b border-card-border bg-background/85 px-4 py-3 backdrop-blur-2xl sm:px-6 sm:py-4 lg:px-8">
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
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-card-border bg-muted text-foreground/70 backdrop-blur-md transition hover:bg-surface-strong"
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
                    <ThemeToggle />

                    <button
                      type="button"
                      aria-label="Notifications"
                      className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-card-border bg-muted text-foreground/60 backdrop-blur-md transition hover:border-muted-border hover:text-foreground"
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

                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-card-border bg-muted backdrop-blur-md">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-violet text-xs font-bold text-white">
                        {firstName.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/40">
                    {activeItem === "Overview"
                      ? "Personal workspace"
                      : activeItem}
                  </p>

                  <h1 className="text-xl font-semibold tracking-[-0.025em] text-foreground">
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
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-card-border bg-muted text-foreground/70 backdrop-blur-md transition hover:bg-surface-strong lg:hidden"
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
                    <p className="truncate text-xs font-semibold uppercase tracking-[0.18em] text-foreground/40">
                      {activeItem === "Overview"
                        ? "Personal workspace"
                        : activeItem}
                    </p>

                    <h1 className="truncate text-2xl font-semibold tracking-[-0.025em] text-foreground">
                      {activeItem === "Overview"
                        ? `Good to see you, ${firstName}.`
                        : getSectionTitle(activeItem)}
                    </h1>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <ThemeToggle />

                  <button
                    type="button"
                    aria-label="Notifications"
                    className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-card-border bg-muted text-foreground/60 backdrop-blur-md transition hover:border-muted-border hover:text-foreground"
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

                  <div className="flex h-11 items-center gap-3 rounded-2xl border border-card-border bg-muted px-2 pr-3 backdrop-blur-md">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-violet text-xs font-bold text-white">
                      {firstName.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <p className="max-w-[150px] truncate text-sm font-semibold text-foreground">
                        {firstName}
                      </p>

                      <p className="max-w-[150px] truncate text-xs text-foreground/40">
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
      {/* Always dark, regardless of the workspace theme toggle — this is a
          fixed brand accent band (same idea as landing's dark surfaces and
          the cta-gradient buttons), not a themed surface, so its text stays
          hardcoded white rather than following --foreground. */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-surface-dark-card px-6 py-7 text-white shadow-[0_30px_80px_rgba(0,0,0,0.3)] sm:px-8 sm:py-9">
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
            <AnimatedLogo className="h-12 w-12" />
          </motion.div>

          <div>
            <p className="text-base font-bold tracking-[-0.02em] text-foreground">
              Orenios AI
            </p>

            <p className="text-xs text-foreground/40">
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
              className={`group flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
                isActive
                  ? "border-accent-violet/25 bg-gradient-to-r from-accent-violet/20 to-accent-cyan/10 text-foreground"
                  : "border-transparent text-foreground/50 hover:bg-muted hover:text-foreground"
              }`}
            >
              <span
                className={
                  isActive
                    ? "text-accent-cyan"
                    : "text-foreground/30 transition group-hover:text-accent-violet"
                }
              >
                {item.icon}
              </span>

              <span>{item.label}</span>

              {item.label === "AI Coach" && (
                <span
                  className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                    isActive
                      ? "bg-surface-strong text-foreground/70"
                      : "bg-accent-violet/15 text-accent-violet"
                  }`}
                >
                  AI
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-8 rounded-3xl border border-card-border bg-card p-5 text-foreground backdrop-blur-[12px]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-foreground/55">
            Daily progress
          </span>

          <span className="text-xs font-semibold text-emerald-600 dark:text-accent-mint">
            {progressLabel}
          </span>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: progressWidth }}
            transition={{
              duration: 0.5,
              delay: 0.3,
              ease: "easeOut",
            }}
            className="h-full rounded-full bg-accent-mint"
          />
        </div>

        <p className="mt-4 text-xs leading-5 text-foreground/45">
          {progressCaption}
        </p>
      </div>

      <div className="mt-auto pt-6">
        <div className="mb-3 rounded-2xl border border-card-border bg-card px-4 py-3 backdrop-blur-[12px]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground/40">
            Signed in as
          </p>

          <p className="mt-1 truncate text-xs font-medium text-foreground/70">
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

function OverviewContent({
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

      <motion.div variants={overviewItem}>
        <TasksCard />
      </motion.div>

      <motion.div
        variants={overviewItem}
        className="flex items-center justify-between gap-4 pt-2"
      >
        <div>
          <p className="text-lg font-semibold tracking-[-0.025em] text-foreground">
            Your goals
          </p>

          <p className="mt-1 text-sm text-foreground/40">
            Keep long-term progress connected to today.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate("Goals")}
          className="flex min-h-[44px] shrink-0 items-center rounded-2xl border border-muted-border bg-muted px-4 text-sm font-semibold text-foreground/70 backdrop-blur-md transition hover:border-border-strong hover:text-foreground"
        >
          Open Goals
        </button>
      </motion.div>

      <motion.div variants={overviewItem}>
        <GoalsCard />
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
    <div className="rounded-3xl border border-card-border bg-card p-6 backdrop-blur-[12px] transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-violet/25 hover:shadow-[0_20px_45px_-15px_rgba(124,111,240,0.35)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-foreground/90">
            {title}
          </p>

          <p className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-foreground">
            {value}
          </p>

          <p className="mt-2 text-sm text-foreground/40">
            {description}
          </p>
        </div>

        <span className="rounded-full bg-surface-strong px-3 py-1.5 text-xs font-semibold text-foreground/60">
          {accent}
        </span>
      </div>
    </div>
  );
}

function ComingSoonContent({ title }: { title: string }) {
  return (
    <div className="flex min-h-[65vh] items-center justify-center">
      <div className="w-full max-w-xl rounded-3xl border border-card-border bg-card p-10 text-center backdrop-blur-[12px]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-violet/15 text-accent-violet">
          <span className="text-xl">✦</span>
        </div>

        <h2 className="mt-6 text-3xl font-semibold tracking-[-0.04em] text-foreground">
          {title} is coming next.
        </h2>

        <p className="mt-4 text-sm leading-6 text-foreground/50">
          This section is already part of the Orenios workspace and will be
          connected to real user data as we build the product.
        </p>
      </div>
    </div>
  );
}