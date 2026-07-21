"use client";

import { motion, useReducedMotion } from "framer-motion";

const ringRadius = 50;
const ringCircumference = 2 * Math.PI * ringRadius;
const consistencyScore = 82;
const ringOffset = ringCircumference * (1 - consistencyScore / 100);

const reviewPoints = [
  {
    label: "Biggest win",
    value: "Shipped the onboarding flow two days early",
    accent: "text-emerald-300",
  },
  {
    label: "Recurring distraction",
    value: "Late-night phone scrolling, four nights this week",
    accent: "text-amber-300",
  },
  {
    label: "Next week",
    value: "Block two mornings for deep work before meetings start",
    accent: "text-violet-300",
  },
];

export default function WeeklyReview() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="weekly-review"
      className="relative mx-auto mt-32 max-w-5xl px-6 sm:mt-28"
    >
      <motion.div
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 24 }}
        whileInView={
          prefersReducedMotion ? undefined : { opacity: 1, y: 0 }
        }
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="text-center"
      >
        <p className="shimmer-c bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-sm font-medium uppercase tracking-[0.3em] text-transparent">
          WEEKLY REVIEW
        </p>

        <h2 className="mt-4 text-4xl font-bold text-white sm:text-5xl">
          Your week, reviewed automatically.
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg sm:leading-8">
          Every Sunday, Orenios looks back at your week and hands you a
          plan for the next one.
        </p>
      </motion.div>

      <motion.div
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 24 }}
        whileInView={
          prefersReducedMotion ? undefined : { opacity: 1, y: 0 }
        }
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto mt-12 max-w-3xl rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.2)] backdrop-blur-sm sm:mt-16 sm:p-8"
      >
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:gap-10">
          <div className="relative flex h-32 w-32 shrink-0 items-center justify-center">
            <svg viewBox="0 0 120 120" className="h-32 w-32 -rotate-90">
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
                whileInView={{ strokeDashoffset: ringOffset }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
              />
            </svg>

            <div className="absolute flex h-[92px] w-[92px] items-center justify-center rounded-full bg-[#101017]">
              <div className="text-center">
                <p className="text-2xl font-bold tracking-[-0.04em] text-white">
                  {consistencyScore}%
                </p>

                <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-500">
                  Consistency
                </p>
              </div>
            </div>
          </div>

          <div className="w-full space-y-4">
            {reviewPoints.map((point) => (
              <div key={point.label}>
                <p
                  className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${point.accent}`}
                >
                  {point.label}
                </p>

                <p className="mt-1 text-sm leading-6 text-zinc-300 sm:text-base">
                  {point.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
