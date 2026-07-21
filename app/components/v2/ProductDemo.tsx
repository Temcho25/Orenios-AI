"use client";

import { motion, useReducedMotion } from "framer-motion";

const scheduleItems = [
  {
    title: "Work",
    time: "Until 6:00 PM",
    dot: "bg-blue-500",
    classes:
      "border-blue-500/20 bg-blue-500/10 text-blue-300",
  },
  {
    title: "Gym",
    time: "7:00 PM · 1h",
    dot: "bg-orange-500",
    classes:
      "border-orange-500/20 bg-orange-500/10 text-orange-300",
  },
];

const taskItems = [
  {
    title: "Finish presentation",
    priority: "high" as const,
    classes: "border-red-500/20 bg-red-500/10 text-red-300",
  },
  {
    title: "Buy groceries",
    priority: "low" as const,
    classes: "border-blue-500/20 bg-blue-500/10 text-blue-300",
  },
];

export default function ProductDemo() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="demo"
      className="relative mx-auto mt-32 max-w-6xl px-6 sm:mt-28"
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
        <div className="inline-flex rounded-full border border-violet-400/30 bg-violet-500/10 px-5 py-2 text-sm font-medium text-violet-300">
          SEE IT WORK
        </div>

        <h2 className="mt-6 text-4xl font-bold tracking-tight text-white sm:mt-8 sm:text-5xl">
          Talk about your day.
          <br />
          Watch it organize itself.
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-400 sm:mt-8 sm:text-xl sm:leading-9">
          No forms, no manual sorting. Say what&apos;s on your mind the way
          you&apos;d tell a friend.
        </p>
      </motion.div>

      <div className="relative mt-16 grid items-center gap-6 sm:mt-20 lg:grid-cols-[1fr_auto_1fr] lg:gap-8">
        {/* Left: what the user says */}
        <motion.div
          initial={
            prefersReducedMotion ? undefined : { opacity: 0, x: -20 }
          }
          whileInView={
            prefersReducedMotion ? undefined : { opacity: 1, x: 0 }
          }
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.2)] backdrop-blur-sm sm:p-8"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">
            You say
          </p>

          <div className="mt-5 flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[10px] font-bold text-white/70">
              YOU
            </div>

            <div className="rounded-2xl rounded-tl-md border border-white/10 bg-white/[0.06] px-4 py-3.5">
              <p className="text-sm leading-7 text-zinc-200 sm:text-base">
                &ldquo;I work until 6. Gym at 7. Need groceries. Need to
                finish my presentation.&rdquo;
              </p>
            </div>
          </div>
        </motion.div>

        {/* Connector */}
        <div
          className="flex items-center justify-center lg:flex-col"
          aria-hidden="true"
        >
          <span className="shimmer-a hidden h-px w-8 bg-gradient-to-r from-violet-300/60 to-cyan-300/60 lg:block" />

          <motion.span
            animate={
              prefersReducedMotion
                ? undefined
                : { scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }
            }
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-violet-400/30 bg-[#0d0c14] text-lg text-violet-300 lg:my-2"
          >
            <span className="hidden lg:inline">↓</span>
            <span className="lg:hidden">↓</span>
          </motion.span>

          <span className="shimmer-b hidden h-px w-8 bg-gradient-to-r from-cyan-300/60 to-violet-300/60 lg:block" />
        </div>

        {/* Right: what Orenios creates */}
        <motion.div
          initial={
            prefersReducedMotion ? undefined : { opacity: 0, x: 20 }
          }
          whileInView={
            prefersReducedMotion ? undefined : { opacity: 1, x: 0 }
          }
          viewport={{ once: true, amount: 0.4 }}
          transition={{
            duration: 0.5,
            delay: 0.12,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.2)] backdrop-blur-sm sm:p-8"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">
            Orenios instantly creates
          </p>

          <div className="mt-5 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-500">
              Schedule
            </p>

            {scheduleItems.map((item) => (
              <div
                key={item.title}
                className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${item.dot}`}
                  />
                  <span className="text-sm font-medium text-zinc-200">
                    {item.title}
                  </span>
                </div>

                <span
                  className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${item.classes}`}
                >
                  {item.time}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-500">
              Priorities
            </p>

            {taskItems.map((item) => (
              <div
                key={item.title}
                className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
              >
                <span className="text-sm font-medium text-zinc-200">
                  {item.title}
                </span>

                <span
                  className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${item.classes}`}
                >
                  {item.priority}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
            <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
            <span className="text-sm font-medium text-emerald-300">
              Reminder set for 6:45 PM — leave for the gym
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
