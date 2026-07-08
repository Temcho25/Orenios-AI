"use client";

import { motion } from "framer-motion";

const cards = [
  {
    title: "Focus Score",
    value: "92%",
    color: "from-violet-500 to-fuchsia-500",
  },
  {
    title: "Tasks Today",
    value: "7",
    color: "from-cyan-500 to-sky-500",
  },
  {
    title: "Goals Progress",
    value: "68%",
    color: "from-emerald-500 to-green-500",
  },
];

export default function StatsCards() {
  return (
    <div className="grid grid-cols-3 gap-6">

      {cards.map((card, index) => (

        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            delay: index * 0.1,
          }}
          whileHover={{
            y: -8,
            scale: 1.03,
          }}
          className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
        >

          <div
            className={`h-2 bg-gradient-to-r ${card.color}`}
          />

          <div className="p-7">

            <p className="text-sm font-medium text-gray-500">
              {card.title}
            </p>

            <h2 className="mt-4 text-5xl font-black text-black">
              {card.value}
            </h2>

            <p className="mt-5 text-sm text-gray-400">
              Updated just now
            </p>

          </div>

        </motion.div>

      ))}

    </div>
  );
}