"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function FounderNote() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.section
      initial={
        prefersReducedMotion ? undefined : { opacity: 0, y: 24 }
      }
      whileInView={
        prefersReducedMotion ? undefined : { opacity: 1, y: 0 }
      }
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto mt-24 max-w-3xl px-6 text-center"
    >
      <div className="rounded-3xl border border-gray-200/70 bg-white/70 px-8 py-10 shadow-[0_10px_30px_rgba(15,23,42,0.04)] backdrop-blur-md">
        <p className="text-lg font-medium leading-8 text-gray-800 sm:text-xl">
          Built in public by one founder — no team, no funding, real
          progress every day.
        </p>

        <a
          href="https://www.instagram.com/orenios.ai/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-violet-600 transition hover:text-violet-700"
        >
          Follow the build on Instagram
          <span aria-hidden="true">→</span>
        </a>
      </div>
    </motion.section>
  );
}
