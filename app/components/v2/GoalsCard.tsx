"use client";

import { motion } from "framer-motion";

export default function GoalsCard() {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm"
    >
      <h3 className="text-2xl font-bold">
        Goals
      </h3>

      <p className="mt-2 text-gray-500">
        Current progress
      </p>

      <div className="mt-8 space-y-6">

        <div>

          <div className="flex justify-between">

            <span>Launch Orenios</span>

            <span>82%</span>

          </div>

          <div className="mt-3 h-3 rounded-full bg-gray-100">

            <div className="h-3 w-[82%] rounded-full bg-gradient-to-r from-violet-500 to-cyan-500"/>

          </div>

        </div>

        <div>

          <div className="flex justify-between">

            <span>1000 Waitlist</span>

            <span>12%</span>

          </div>

          <div className="mt-3 h-3 rounded-full bg-gray-100">

            <div className="h-3 w-[12%] rounded-full bg-gradient-to-r from-violet-500 to-cyan-500"/>

          </div>

        </div>

      </div>

    </motion.div>
  );
}