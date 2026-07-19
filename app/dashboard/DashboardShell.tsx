"use client";

import { motion, MotionConfig } from "framer-motion";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { createClient } from "../lib/supabase";
import { getLocalDateKey } from "../lib/date-utils";
import { navigationItems } from "./navigationItems";
import SidebarContent from "./SidebarContent";
import { getSectionTitle, DashboardContent } from "./DashboardContent";

type DashboardShellProps = {
  firstName: string;
  email: string;
};

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
        .eq("focus_date", getLocalDateKey())
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
    <MotionConfig reducedMotion="user">
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
    </MotionConfig>
  );
}
