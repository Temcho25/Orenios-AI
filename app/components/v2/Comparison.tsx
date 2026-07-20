"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check, X } from "lucide-react";

const chatGptPoints = [
  "Gives advice",
  "Forgets everything next chat",
  "No calendar",
  "No follow-up",
  "No long-term memory",
];

const oreniosPoints = [
  "Organizes your day",
  "Remembers your life",
  "Plans ahead automatically",
  "Manages your calendar",
  "Daily evening check-ins",
  "Weekly AI reviews",
  "Gets smarter every week",
];

export default function Comparison() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="compare"
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
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-violet-300">
          WHY IT&apos;S DIFFERENT
        </p>

        <h2 className="mt-4 text-4xl font-bold text-white sm:text-5xl">
          Not another chatbot.
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg sm:leading-8">
          ChatGPT gives you advice and moves on. Orenios actually does the
          organizing — and remembers you tomorrow.
        </p>
      </motion.div>

      <div className="mx-auto mt-12 grid max-w-4xl gap-5 sm:mt-16 sm:gap-6 md:grid-cols-2">
        <motion.div
          initial={
            prefersReducedMotion ? undefined : { opacity: 0, y: 24 }
          }
          whileInView={
            prefersReducedMotion ? undefined : { opacity: 1, y: 0 }
          }
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500">
            ChatGPT
          </p>

          <ul className="mt-6 space-y-4">
            {chatGptPoints.map((point) => (
              <li
                key={point}
                className="flex items-start gap-3 text-zinc-500"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/5">
                  <X className="h-3 w-3" strokeWidth={2.5} />
                </span>
                <span className="text-sm leading-6 sm:text-base">
                  {point}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={
            prefersReducedMotion ? undefined : { opacity: 0, y: 24 }
          }
          whileInView={
            prefersReducedMotion ? undefined : { opacity: 1, y: 0 }
          }
          viewport={{ once: true, amount: 0.3 }}
          transition={{
            duration: 0.5,
            delay: 0.1,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative overflow-hidden rounded-3xl border border-violet-400/30 bg-white/[0.04] p-6 shadow-[0_0_0_1px_rgba(139,92,246,0.15),0_30px_65px_rgba(124,58,237,0.25)] sm:p-8"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 opacity-[0.2] blur-[60px]"
          />

          <p className="relative text-sm font-semibold uppercase tracking-[0.14em] text-transparent bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text">
            Orenios
          </p>

          <ul className="relative mt-6 space-y-4">
            {oreniosPoints.map((point) => (
              <li
                key={point}
                className="flex items-start gap-3 text-zinc-100"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400">
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                </span>
                <span className="text-sm leading-6 sm:text-base">
                  {point}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
