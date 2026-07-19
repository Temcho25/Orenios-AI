"use client";

import { motion } from "framer-motion";
import AnimatedLogo from "../components/v2/AnimatedLogo";
import LogoutButton from "./LogoutButton";
import { navigationItems } from "./navigationItems";

type SidebarContentProps = {
  activeItem: string;
  email: string;
  onSelect: (item: string) => void;
  dailyProgress: number | null;
  dailyProgressLoaded: boolean;
};

export default function SidebarContent({
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
