"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function OrbitalRings() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2"
    >
      <motion.svg
        viewBox="0 0 520 520"
        className="h-[300px] w-[300px] opacity-80 sm:h-[440px] sm:w-[440px] md:h-[520px] md:w-[520px] lg:h-[600px] lg:w-[600px]"
        initial={{ rotate: 0 }}
        animate={prefersReducedMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 46, repeat: Infinity, ease: "linear" }}
      >
        <circle
          cx="260"
          cy="260"
          r="248"
          fill="none"
          stroke="url(#orenios-orbit-outer)"
          strokeWidth="1.3"
          strokeDasharray="1.5 8"
        />
        <circle cx="260" cy="12" r="5" fill="#c4b5fd" />
        <defs>
          <linearGradient
            id="orenios-orbit-outer"
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#67e8f9" stopOpacity="0.1" />
          </linearGradient>
        </defs>
      </motion.svg>

      <motion.svg
        viewBox="0 0 520 520"
        className="absolute inset-0 h-[300px] w-[300px] opacity-90 sm:h-[440px] sm:w-[440px] md:h-[520px] md:w-[520px] lg:h-[600px] lg:w-[600px]"
        initial={{ rotate: 0 }}
        animate={prefersReducedMotion ? undefined : { rotate: -360 }}
        transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
      >
        <circle
          cx="260"
          cy="260"
          r="185"
          fill="none"
          stroke="url(#orenios-orbit-inner)"
          strokeWidth="1.6"
        />
        <circle cx="445" cy="260" r="4.5" fill="#67e8f9" />
        <defs>
          <linearGradient
            id="orenios-orbit-inner"
            x1="0"
            y1="1"
            x2="1"
            y2="0"
          >
            <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.1" />
          </linearGradient>
        </defs>
      </motion.svg>
    </div>
  );
}
