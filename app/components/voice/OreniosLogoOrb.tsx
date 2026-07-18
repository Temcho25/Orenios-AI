"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type OreniosLogoOrbProps = {
  // true while this is shown as the live recording indicator (adds the
  // slow satellite drift + soft breathing glow). false renders the
  // logo at rest, fully static.
  active?: boolean;
  size?: number;
  className?: string;
};

// Geometry measured directly from public/logo2.PNG (the real Orenios
// mark) by sampling its pixels: sphere/ring radii, ring thickness, and
// both satellite dots' exact center + radius, in the source image's
// own 1024x1024 pixel space. This is a lightweight vector recreation
// of that exact reference, not a reinterpretation — do not restyle
// the geometry below without re-measuring the source asset.
const CENTER = { x: 532, y: 464 };
const CORE_RADIUS = 82;
const MID_RING_RADIUS = 146;
const MID_RING_WIDTH = 30;
const OUTER_RING_RADIUS = 250;
const OUTER_RING_WIDTH = 32;
const DOT_UPPER = { x: 710, y: 275, r: 43.5 };
const DOT_LOWER = { x: 704, y: 638, r: 40 };

export default function OreniosLogoOrb({
  active = true,
  size = 132,
  className = "",
}: OreniosLogoOrbProps) {
  const uid = useId();
  const prefersReducedMotion = useReducedMotion();
  const animated = active && !prefersReducedMotion;

  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 1024 1024" width={size} height={size} className="overflow-visible">
        <defs>
          <radialGradient id={`${uid}-sphere`} cx="62%" cy="35%" r="75%">
            <stop offset="0%" stopColor="#d9ccff" />
            <stop offset="45%" stopColor="#8b6bff" />
            <stop offset="100%" stopColor="#3d6ffa" />
          </radialGradient>

          <linearGradient id={`${uid}-ring`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8b4fff" />
            <stop offset="100%" stopColor="#2c90ff" />
          </linearGradient>

          <radialGradient id={`${uid}-dot`} cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#e7ddff" />
            <stop offset="50%" stopColor="#8b6bff" />
            <stop offset="100%" stopColor="#3d6ffa" />
          </radialGradient>

          <filter id={`${uid}-ambient-blur`} x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="46" />
          </filter>

          <filter id={`${uid}-dot-blur`} x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>

        {/* Soft ambient cyan-purple glow behind the mark */}
        <motion.circle
          cx={CENTER.x}
          cy={CENTER.y}
          r={CORE_RADIUS * 2.6}
          fill={`url(#${uid}-sphere)`}
          filter={`url(#${uid}-ambient-blur)`}
          animate={
            animated
              ? { opacity: [0.28, 0.46, 0.28] }
              : { opacity: active ? 0.32 : 0.2 }
          }
          transition={
            animated
              ? { duration: 4.4, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.5, ease: "easeOut" }
          }
        />

        {/* Middle ring — stays clean and stable, never rotates */}
        <circle
          cx={CENTER.x}
          cy={CENTER.y}
          r={MID_RING_RADIUS}
          fill="none"
          stroke={`url(#${uid}-ring)`}
          strokeWidth={MID_RING_WIDTH}
          opacity="0.88"
        />

        {/* Outer ring — same, static */}
        <circle
          cx={CENTER.x}
          cy={CENTER.y}
          r={OUTER_RING_RADIUS}
          fill="none"
          stroke={`url(#${uid}-ring)`}
          strokeWidth={OUTER_RING_WIDTH}
          opacity="0.88"
        />

        {/* The two satellite dots drift slowly together around the
            mark while recording; the rings underneath never move. */}
        <motion.g
          style={{ transformOrigin: `${CENTER.x}px ${CENTER.y}px` }}
          animate={animated ? { rotate: 360 } : { rotate: 0 }}
          transition={
            animated
              ? { duration: 54, repeat: Infinity, ease: "linear" }
              : { duration: 0.5, ease: "easeOut" }
          }
        >
          <circle
            cx={DOT_UPPER.x}
            cy={DOT_UPPER.y}
            r={DOT_UPPER.r * 1.5}
            fill={`url(#${uid}-dot)`}
            filter={`url(#${uid}-dot-blur)`}
            opacity="0.5"
          />
          <circle
            cx={DOT_UPPER.x}
            cy={DOT_UPPER.y}
            r={DOT_UPPER.r}
            fill={`url(#${uid}-dot)`}
          />

          <circle
            cx={DOT_LOWER.x}
            cy={DOT_LOWER.y}
            r={DOT_LOWER.r * 1.5}
            fill={`url(#${uid}-dot)`}
            filter={`url(#${uid}-dot-blur)`}
            opacity="0.5"
          />
          <circle
            cx={DOT_LOWER.x}
            cy={DOT_LOWER.y}
            r={DOT_LOWER.r}
            fill={`url(#${uid}-dot)`}
          />
        </motion.g>

        {/* Central sphere — gentle breathing glow while recording */}
        <motion.circle
          cx={CENTER.x}
          cy={CENTER.y}
          r={CORE_RADIUS}
          fill={`url(#${uid}-sphere)`}
          style={{ transformOrigin: `${CENTER.x}px ${CENTER.y}px` }}
          animate={
            animated
              ? { scale: [1, 1.035, 1] }
              : { scale: 1 }
          }
          transition={
            animated
              ? { duration: 3.6, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.5, ease: "easeOut" }
          }
        />
      </svg>
    </div>
  );
}
