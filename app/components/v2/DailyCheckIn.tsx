"use client";

import { motion, useReducedMotion } from "framer-motion";

const questions = [
  "What got done today?",
  "What didn't?",
  "What should change tomorrow?",
];

export default function DailyCheckIn() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="check-in"
      className="relative mx-auto mt-32 max-w-5xl px-6 sm:mt-28"
    >
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <motion.div
          initial={
            prefersReducedMotion ? undefined : { opacity: 0, y: 24 }
          }
          whileInView={
            prefersReducedMotion ? undefined : { opacity: 1, y: 0 }
          }
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center lg:text-left"
        >
          <p className="shimmer-b bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-sm font-medium uppercase tracking-[0.3em] text-transparent">
            DAILY CHECK-IN
          </p>

          <h2 className="mt-4 text-4xl font-bold text-white sm:text-5xl">
            Every evening, a
            <br />
            two-minute check-in.
          </h2>

          <p className="mx-auto mt-5 max-w-md text-base leading-7 text-zinc-400 sm:text-lg sm:leading-8 lg:mx-0">
            Orenios asks three quick questions, then updates tomorrow&apos;s
            plan around your answers.
          </p>
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
          className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.2)] backdrop-blur-sm sm:p-8"
        >
          <div className="space-y-3">
            {questions.map((question, index) => (
              <motion.div
                key={question}
                initial={
                  prefersReducedMotion
                    ? undefined
                    : { opacity: 0, x: -12 }
                }
                whileInView={
                  prefersReducedMotion
                    ? undefined
                    : { opacity: 1, x: 0 }
                }
                viewport={{ once: true, amount: 0.6 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="flex items-start gap-3"
              >
                <div className="shimmer-e flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 text-[10px] font-bold text-white">
                  AI
                </div>

                <div className="rounded-2xl rounded-tl-md border border-white/10 bg-white/[0.06] px-4 py-3">
                  <p className="text-sm leading-6 text-zinc-200 sm:text-base">
                    {question}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={
              prefersReducedMotion ? undefined : { opacity: 0, y: 10 }
            }
            whileInView={
              prefersReducedMotion ? undefined : { opacity: 1, y: 0 }
            }
            viewport={{ once: true, amount: 0.6 }}
            transition={{
              duration: 0.4,
              delay: 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-5 flex items-center gap-2.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3.5"
          >
            <motion.span
              animate={
                prefersReducedMotion
                  ? undefined
                  : { scale: [1, 1.3, 1] }
              }
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="h-2 w-2 shrink-0 rounded-full bg-emerald-400"
            />
            <span className="text-sm font-medium text-emerald-300">
              Tomorrow updated automatically.
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
