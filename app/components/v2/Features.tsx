"use client";

import { motion } from "framer-motion";

const features = [
  {
    emoji: "🧠",
    title: "AI Brain",
    description:
      "Your personal AI remembers context, helps you plan and keeps everything organized.",
  },
  {
    emoji: "🎯",
    title: "Goals",
    description:
      "Track long-term goals with automatic progress and weekly reviews.",
  },
  {
    emoji: "✅",
    title: "Smart Tasks",
    description:
      "AI prioritizes today's work so you always know what matters most.",
  },
  {
    emoji: "📅",
    title: "Calendar",
    description:
      "Meetings, reminders and routines in one intelligent timeline.",
  },
  {
    emoji: "📝",
    title: "Notes",
    description:
      "Capture ideas instantly and connect them with projects and goals.",
  },
  {
    emoji: "⚡",
    title: "Automation",
    description:
      "Let AI automate planning, summaries and repetitive daily work.",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="mx-auto max-w-7xl px-6 py-32"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-violet-600">
          Features
        </p>

        <h2 className="mt-5 text-6xl font-black">
          One app.
          <br />
          Everything organized.
        </h2>

        <p className="mx-auto mt-8 max-w-3xl text-xl leading-9 text-gray-500">
          Stop switching between dozens of productivity apps.
          Orenios AI keeps everything together.
        </p>
      </motion.div>

      <div className="mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {features.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              delay: index * 0.08,
            }}
            whileHover={{
              y: -10,
              scale: 1.03,
            }}
            className="rounded-[32px] border border-white/60 bg-white/80 p-8 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,.08)]"
          >
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 text-3xl text-white">
              {item.emoji}
            </div>

            <h3 className="text-2xl font-bold">
              {item.title}
            </h3>

            <p className="mt-5 leading-8 text-gray-500">
              {item.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}