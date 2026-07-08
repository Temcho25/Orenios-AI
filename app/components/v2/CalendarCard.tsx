"use client";

import { motion } from "framer-motion";

export default function CalendarCard() {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm"
    >
      <h3 className="text-2xl font-bold">
        Calendar
      </h3>

      <p className="mt-2 text-gray-500">
        Upcoming schedule
      </p>

      <div className="mt-8 space-y-4">

        <div className="rounded-2xl bg-violet-50 p-5">
          🥊 Boxing Training
          <p className="mt-2 text-sm text-gray-500">
            Today • 09:00
          </p>
        </div>

        <div className="rounded-2xl bg-cyan-50 p-5">
          💻 Build Orenios
          <p className="mt-2 text-sm text-gray-500">
            Today • 14:00
          </p>
        </div>

        <div className="rounded-2xl bg-green-50 p-5">
          🚀 Launch Waitlist
          <p className="mt-2 text-sm text-gray-500">
            Tomorrow
          </p>
        </div>

      </div>

    </motion.div>
  );
}