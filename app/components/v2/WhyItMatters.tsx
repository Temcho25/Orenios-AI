"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Coffee,
  Feather,
  ListX,
  Repeat,
  Target,
  Timer,
} from "lucide-react";

const outcomes = [
  {
    title: "Less stress",
    description: "One place holds everything, so nothing has to live in your head.",
    icon: Feather,
  },
  {
    title: "Less planning",
    description: "Say what's going on once — Orenios does the sorting.",
    icon: Timer,
  },
  {
    title: "Fewer forgotten tasks",
    description:
      "Important tasks stay visible, so fewer things slip through the cracks.",
    icon: ListX,
  },
  {
    title: "More consistency",
    description: "Daily check-ins and weekly reviews keep momentum going.",
    icon: Repeat,
  },
  {
    title: "More focus",
    description: "See what actually matters today, not everything at once.",
    icon: Target,
  },
  {
    title: "More free time",
    description: "The time you used to spend planning goes back to living.",
    icon: Coffee,
  },
];

const shimmerVariants = [
  "shimmer-a",
  "shimmer-b",
  "shimmer-c",
  "shimmer-d",
  "shimmer-e",
];

export default function WhyItMatters() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="why-it-matters"
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
        <p className="shimmer-d bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-sm font-medium uppercase tracking-[0.3em] text-transparent">
          WHY IT MATTERS
        </p>

        <h2 className="mt-4 text-4xl font-bold text-white sm:text-5xl">
          What changes for you.
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg sm:leading-8">
          Not new features to learn. A different way your days feel.
        </p>
      </motion.div>

      <div className="mx-auto mt-12 grid max-w-5xl gap-5 sm:mt-16 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {outcomes.map((outcome, index) => (
          <motion.div
            key={outcome.title}
            initial={
              prefersReducedMotion ? undefined : { opacity: 0, y: 24 }
            }
            whileInView={
              prefersReducedMotion ? undefined : { opacity: 1, y: 0 }
            }
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: 0.5,
              delay: (index % 3) * 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <motion.div
              whileHover={prefersReducedMotion ? undefined : { y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative flex h-full flex-col rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.2)] backdrop-blur-sm transition-all duration-300 hover:border-violet-400/40 hover:bg-white/[0.06] sm:p-7"
            >
              <div
                className={`${shimmerVariants[index % shimmerVariants.length]} flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-[0_8px_20px_rgba(124,58,237,0.35)]`}
              >
                <outcome.icon
                  className="h-5 w-5 text-white"
                  strokeWidth={2}
                />
              </div>

              <h3 className="mt-5 text-lg font-semibold text-white">
                {outcome.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-zinc-400">
                {outcome.description}
              </p>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
