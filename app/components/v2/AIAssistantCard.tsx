"use client";

import { motion } from "framer-motion";

export default function AIAssistantCard() {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="rounded-3xl bg-gradient-to-br from-violet-600 to-cyan-500 p-8 text-white shadow-xl"
    >
      <h3 className="text-2xl font-bold">
        AI Assistant
      </h3>

      <p className="mt-6 text-white/90 leading-8">

        Based on today's schedule,
        your highest-impact task is to
        finish the landing page,
        continue growing the waitlist
        and prepare for the public launch.

      </p>

      <button className="mt-8 rounded-full bg-white px-6 py-3 font-semibold text-black transition hover:scale-105">
        Open AI
      </button>

    </motion.div>
  );
}