"use client";

import { motion, useReducedMotion, useScroll } from "framer-motion";
import { Fragment, useRef } from "react";

export default function ProductPreview() {
  const prefersReducedMotion = useReducedMotion();
  const stepsRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: stepsRef,
    offset: ["start 85%", "end 60%"],
  });

  const steps = [
    {
      number: "1",
      text: "Tell Orenios what's on your mind",
    },
    {
      number: "2",
      text: "It turns it into tasks, goals or a plan",
    },
    {
      number: "3",
      text: "You see everything organized in one place",
    },
  ];

  return (
    <section
      id="preview"
      className="relative mx-auto max-w-7xl px-6 py-32"
    >
      <motion.div
        initial={
          prefersReducedMotion ? undefined : { opacity: 0, y: 24 }
        }
        whileInView={
          prefersReducedMotion ? undefined : { opacity: 1, y: 0 }
        }
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="text-center"
      >

        <div className="inline-flex rounded-full border border-violet-400/30 bg-violet-500/10 px-5 py-2 text-sm font-medium text-violet-300">
          HOW IT WORKS
        </div>

        <h2 className="mt-8 text-6xl font-bold tracking-tight text-white">
          From a thought.
          <br />
          To a plan.
        </h2>

        <p className="mx-auto mt-8 max-w-3xl text-xl leading-9 text-zinc-400">
          No manual sorting, no blank to-do list. Just tell Orenios what&apos;s
          going on.
        </p>

      </motion.div>

      <div
        ref={stepsRef}
        className="relative mt-20 flex flex-col gap-6 lg:flex-row lg:items-stretch"
      >
        {!prefersReducedMotion && (
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-14 top-0 w-px bg-white/10 lg:hidden"
          >
            <motion.div
              className="w-full origin-top bg-gradient-to-b from-violet-400 to-cyan-400"
              style={{ scaleY: scrollYProgress, height: "100%" }}
            />
          </div>
        )}

        {steps.map((step, index) => (
          <Fragment key={step.number}>
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
                delay: index * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative flex-1"
            >
            <motion.div
              whileHover={
                prefersReducedMotion ? undefined : { y: -10, scale: 1.02 }
              }
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative h-full rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.2)] backdrop-blur-sm transition-all duration-300 hover:border-violet-400/40 hover:bg-white/[0.06] hover:shadow-[0_0_0_1px_rgba(139,92,246,0.25),0_30px_65px_rgba(124,58,237,0.28)]"
            >
              <motion.div
                initial={
                  prefersReducedMotion
                    ? undefined
                    : { scale: 0.5, opacity: 0 }
                }
                whileInView={
                  prefersReducedMotion
                    ? undefined
                    : { scale: 1, opacity: 1 }
                }
                viewport={{ once: true, amount: 0.6 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 15,
                  delay: index * 0.15,
                }}
                className="relative mb-6 flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-[0_8px_20px_rgba(124,58,237,0.35)]"
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 to-transparent" />

                <span className="relative text-lg font-bold text-white">
                  {step.number}
                </span>
              </motion.div>

              <p className="text-xl font-semibold leading-8 text-white">
                {step.text}
              </p>
            </motion.div>
            </motion.div>

            {index < steps.length - 1 && (
              <div
                className="hidden shrink-0 items-center gap-1.5 px-1 lg:flex"
                aria-hidden="true"
              >
                <span className="h-px w-8 bg-gradient-to-r from-violet-300 to-cyan-300" />
                <span className="text-2xl text-violet-300">→</span>
                <span className="h-px w-8 bg-gradient-to-r from-cyan-300 to-violet-300" />
              </div>
            )}
          </Fragment>
        ))}
      </div>

    </section>
  );
}
