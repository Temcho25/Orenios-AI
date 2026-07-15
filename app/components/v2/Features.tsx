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
      className="mx-auto mt-28 max-w-6xl px-6"
    >
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
        {features.map((feature) => (
          <motion.div
            key={feature.title}
            whileHover={
              prefersReducedMotion ? undefined : { y: -10, scale: 1.02 }
            }
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="rounded-3xl border border-gray-200/70 bg-white/80 p-8 shadow-[0_10px_30px_rgba(15,23,42,0.04)] backdrop-blur-sm transition-shadow duration-300 hover:border-violet-200/70 hover:shadow-[0_30px_60px_rgba(124,58,237,0.12)]"
          >
            <div className="relative mb-6 flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-[0_8px_20px_rgba(124,58,237,0.35)]">
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
        ))}
      </div>
    </section>
  );
}