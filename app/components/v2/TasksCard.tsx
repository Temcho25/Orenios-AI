"use client";

import { motion } from "framer-motion";

const tasks = [
  {
    title: "Launch Orenios Landing",
    done: true,
  },
  {
    title: "Review Waitlist",
    done: true,
  },
  {
    title: "Finish Dashboard UI",
    done: false,
  },
  {
    title: "Prepare Public Launch",
    done: false,
  },
];

export default function TasksCard() {
  return (
    <motion.div
      whileHover={{
        y: -6,
      }}
      className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm"
    >
      <h3 className="text-2xl font-bold">
        Today's Tasks
      </h3>

      <p className="mt-2 text-gray-500">
        AI prioritized your day
      </p>

      <div className="mt-8 space-y-5">

        {tasks.map((task) => (

          <div
            key={task.title}
            className="flex items-center justify-between rounded-2xl bg-gray-50 px-5 py-4"
          >

            <span
              className={
                task.done
                  ? "font-medium"
                  : "font-medium text-gray-500"
              }
            >
              {task.done ? "✅" : "⭕"} {task.title}
            </span>

          </div>

        ))}

      </div>

    </motion.div>
  );
}