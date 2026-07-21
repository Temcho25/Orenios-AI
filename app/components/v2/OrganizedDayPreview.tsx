"use client";

import { motion, useReducedMotion } from "framer-motion";

type ScheduleItem = {
  label: string;
  detail: string;
  auto: boolean;
};

const items: ScheduleItem[] = [
  { label: "Boxing", detail: "9:00 AM", auto: false },
  { label: "Work", detail: "12:00 PM", auto: false },
  { label: "Call Alex", detail: "Reminder added", auto: true },
  { label: "Gym", detail: "Moved to Saturday", auto: true },
  { label: "Morning plan", detail: "Automatically adjusted", auto: true },
];

/**
 * Stage 3 of the hero's chaos-to-orbit story: the same conversation,
 * now structured. Rows are distinguished by more than color alone —
 * auto-managed rows also get a pulsing dot and their own descriptive
 * text ("Moved to Saturday" vs a plain time), so the state reads even
 * without color vision.
 */
export default function OrganizedDayPreview() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-sm sm:px-5 sm:py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-300">
        Organized by Orenios
      </p>

      <motion.ul
        className="mt-3 space-y-1.5"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: prefersReducedMotion
              ? {}
              : { staggerChildren: 0.09, delayChildren: 0.5 },
          },
        }}
      >
        {items.map((item) => (
          <motion.li
            key={item.label}
            variants={{
              hidden: prefersReducedMotion ? {} : { opacity: 0, y: 8 },
              visible: prefersReducedMotion ? {} : { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-between gap-3 rounded-lg bg-white/[0.03] px-3 py-2"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-zinc-200">
              <span
                aria-hidden="true"
                className={
                  item.auto
                    ? "status-dot-pulse h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300"
                    : "h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-500"
                }
              />
              {item.label}
            </span>

            <span
              className={
                item.auto
                  ? "text-xs font-medium text-cyan-300"
                  : "text-xs font-medium text-zinc-400"
              }
            >
              {item.detail}
            </span>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}
