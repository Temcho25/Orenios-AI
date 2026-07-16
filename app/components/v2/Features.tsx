"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Compass, ListChecks, Sparkles, Target } from "lucide-react";

export default function Features() {
  const prefersReducedMotion = useReducedMotion();

  const features = [
    {
      title: "AI Life Planning",
      description:
        "Plan your days, weeks and long-term goals with one intelligent assistant.",
      icon: Sparkles,
    },
    {
      title: "Smart Tasks",
      description:
        "Organize tasks automatically and always know what matters most.",
      icon: ListChecks,
    },
    {
      title: "Goals Tracking",
      description:
        "Track progress across every important area of your life.",
      icon: Target,
    },
    {
      title: "Daily AI Coach",
      description:
        "Receive personalized suggestions based on your schedule and habits.",
      icon: Compass,
    },
  ];

  return (
    <section
      id="features"
      className="relative mx-auto mt-28 max-w-6xl px-6"
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
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-violet-300">
          FEATURES
        </p>

        <h2 className="mt-4 text-5xl font-bold text-white">
          Everything you need.
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-zinc-400">
          Orenios AI becomes your personal operating system for life —
          helping you organize, plan and achieve more every day.
        </p>
      </motion.div>

      <div className="mx-auto mt-16 grid max-w-5xl items-stretch gap-6 md:grid-cols-2">
        {features.map((feature, index) => {
          const isAlt = index % 2 === 1;

          return (
            <motion.div
              key={feature.title}
              initial={
                prefersReducedMotion ? undefined : { opacity: 0, y: 24 }
              }
              whileInView={
                prefersReducedMotion ? undefined : { opacity: 1, y: 0 }
              }
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.5,
                delay: index * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative h-full"
            >
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute -z-10 h-40 w-40 rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 opacity-[0.18] blur-[60px] ${
                  isAlt ? "-bottom-6 -left-6" : "-top-6 -right-6"
                }`}
              />

              <motion.div
                whileHover={prefersReducedMotion ? undefined : { y: -4 }}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.2)] backdrop-blur-sm transition-all duration-300 hover:border-violet-400/40 hover:bg-white/[0.06] hover:shadow-[0_0_0_1px_rgba(139,92,246,0.25),0_30px_65px_rgba(124,58,237,0.3)]"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 -z-10 opacity-[0.03]"
                  style={{
                    backgroundImage: `
                      linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)
                    `,
                    backgroundSize: "26px 26px",
                  }}
                />

                <div
                  className={`relative mb-6 flex h-12 w-12 items-center justify-center overflow-hidden shadow-[0_8px_20px_rgba(124,58,237,0.35)] ${
                    isAlt
                      ? "rounded-full bg-gradient-to-tr from-violet-500 to-cyan-400"
                      : "rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400"
                  }`}
                >
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 to-transparent" />

                  <feature.icon
                    className="relative h-6 w-6 text-white"
                    strokeWidth={2}
                  />
                </div>

                <h3 className="text-xl font-semibold text-white">
                  {feature.title}
                </h3>

                <p className="mt-3 leading-7 text-zinc-400">
                  {feature.description}
                </p>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}