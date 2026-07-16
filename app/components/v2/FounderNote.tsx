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
      className="mx-auto mt-28 max-w-3xl px-6 text-center sm:mt-24"
    >
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-8 shadow-[0_10px_30px_rgba(0,0,0,0.2)] backdrop-blur-md sm:px-8 sm:py-10">
        <p className="text-base font-medium leading-7 text-zinc-200 sm:text-lg sm:leading-8 md:text-xl">
          Built in public by one founder — no team, no funding, real
          progress every day.
        </p>

        <a
          href="https://www.instagram.com/orenios.ai/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-violet-300 transition hover:text-violet-200 active:text-violet-200"
        >
          Follow the build on Instagram
          <span aria-hidden="true">→</span>
        </a>
      </div>
    </motion.section>
  );
}
