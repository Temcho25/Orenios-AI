"use client";

import { motion, useReducedMotion } from "framer-motion";
import AnimatedLogo from "./AnimatedLogo";
import OrbitalRings from "./OrbitalRings";

const memoryItems = [
  { label: "Goals" },
  { label: "Habits" },
  { label: "Routines" },
  { label: "Work schedule" },
  { label: "Deadlines" },
  { label: "Preferences" },
];

export default function MemorySection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="memory"
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
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-violet-300">
          LONG-TERM MEMORY
        </p>

        <h2 className="mt-4 text-4xl font-bold text-white sm:text-5xl">
          It remembers your life.
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg sm:leading-8">
          The longer you use Orenios, the smarter it gets. Every
          conversation adds to what it knows about how you actually work.
        </p>
      </motion.div>

      <div className="relative mx-auto mt-16 flex max-w-xl flex-col items-center sm:mt-20">
        <motion.div
          initial={
            prefersReducedMotion ? undefined : { opacity: 0, scale: 0.85 }
          }
          whileInView={
            prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }
          }
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex h-40 w-40 items-center justify-center sm:h-48 sm:w-48"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-violet-500/40 to-cyan-400/30 blur-[60px]"
          />

          {!prefersReducedMotion && (
            <div className="absolute inset-0 flex items-center justify-center opacity-70">
              <OrbitalRings />
            </div>
          )}

          <AnimatedLogo className="h-20 w-20 sm:h-24 sm:w-24" />
        </motion.div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:mt-12 sm:gap-4">
          {memoryItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={
                prefersReducedMotion
                  ? undefined
                  : { opacity: 0, y: 12, scale: 0.9 }
              }
              whileInView={
                prefersReducedMotion
                  ? undefined
                  : { opacity: 1, y: 0, scale: 1 }
              }
              viewport={{ once: true, amount: 0.6 }}
              transition={{
                duration: 0.4,
                delay: 0.15 + index * 0.07,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-zinc-200 backdrop-blur-sm sm:px-5 sm:py-3 sm:text-base"
            >
              {item.label}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
