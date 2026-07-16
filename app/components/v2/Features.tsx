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
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-0 h-[420px] w-[420px] rounded-full bg-violet-400/10 blur-[130px]" />
        <div className="absolute -right-24 bottom-0 h-[380px] w-[380px] rounded-full bg-cyan-400/10 blur-[130px]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(124,58,237,.6) 1px, transparent 1px),
              linear-gradient(90deg, rgba(124,58,237,.6) 1px, transparent 1px)
            `,
            backgroundSize: "56px 56px",
          }}
        />
      </div>

      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-violet-600">
          FEATURES
        </p>

        <h2 className="mt-4 text-5xl font-bold text-black">
          Everything you need.
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-500">
          Orenios AI becomes your personal operating system for life —
          helping you organize, plan and achieve more every day.
        </p>
      </div>

      <div className="mx-auto mt-16 grid max-w-5xl gap-6 md:grid-cols-2">
        {features.map((feature, index) => {
          const isAlt = index % 2 === 1;

          return (
            <motion.div
              key={feature.title}
              whileHover={prefersReducedMotion ? undefined : { y: -4 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="rounded-3xl border border-gray-200/70 bg-white/80 p-8 shadow-[0_10px_30px_rgba(15,23,42,0.04)] backdrop-blur-sm transition-shadow duration-300 hover:border-violet-200/70 hover:shadow-[0_30px_60px_rgba(124,58,237,0.14)]"
            >
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

              <h3 className="text-xl font-semibold text-black">
                {feature.title}
              </h3>

              <p className="mt-3 leading-7 text-gray-500">
                {feature.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}