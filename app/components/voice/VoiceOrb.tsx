"use client";

import { useEffect, useId } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";

export type VoiceUIState = "idle" | "listening" | "thinking" | "speaking";

export type VoiceOrbProps = {
  state: VoiceUIState;
  // 0-1 input level. Optional on purpose: nothing in the app wires a
  // real Web Audio API analyser into the voice recording flow yet, so
  // when this is left undefined the orb drives itself with a gentle
  // synthetic level (listening state only) instead of sitting static.
  // Passing a real value later needs no change here.
  audioLevel?: number;
  size?: number;
  className?: string;
  // Escape hatch for rendering outside the app's themed subtree (which
  // normally drives colors automatically via the `.dark` ancestor
  // class next-themes already manages). Leave unset in the app.
  darkMode?: boolean;
};

const RING_ROTATION_SECONDS: Record<
  VoiceUIState,
  { outer: number; middle: number; inner: number }
> = {
  idle: { outer: 36, middle: 26, inner: 17 },
  listening: { outer: 22, middle: 15, inner: 10 },
  thinking: { outer: 11, middle: 7.5, inner: 5 },
  speaking: { outer: 17, middle: 12, inner: 8 },
};

const RING_OPACITY: Record<
  VoiceUIState,
  { outer: number; middle: number; inner: number }
> = {
  idle: { outer: 0.28, middle: 0.22, inner: 0.18 },
  listening: { outer: 0.44, middle: 0.36, inner: 0.3 },
  thinking: { outer: 0.52, middle: 0.44, inner: 0.38 },
  speaking: { outer: 0.4, middle: 0.32, inner: 0.26 },
};

const CORE_BREATH_SECONDS: Record<VoiceUIState, number> = {
  idle: 4.2,
  listening: 2.4,
  thinking: 1.5,
  speaking: 0.85,
};

const CORE_BREATH_SCALE: Record<VoiceUIState, [number, number]> = {
  idle: [1, 1.05],
  listening: [1, 1.1],
  thinking: [1, 1.07],
  speaking: [0.97, 1.1],
};

const CORE_GLOW_OPACITY: Record<VoiceUIState, number> = {
  idle: 0.35,
  listening: 0.55,
  thinking: 0.78,
  speaking: 0.62,
};

const REDUCED_MOTION_ROTATION: Record<VoiceUIState, number> = {
  idle: 0,
  listening: 14,
  thinking: 34,
  speaking: 22,
};

const REDUCED_MOTION_SCALE: Record<VoiceUIState, number> = {
  idle: 1,
  listening: 1.05,
  thinking: 1.08,
  speaking: 1.06,
};

export default function VoiceOrb({
  state,
  audioLevel,
  size = 96,
  className = "",
  darkMode,
}: VoiceOrbProps) {
  const gradientId = useId();
  const prefersReducedMotion = useReducedMotion();

  // Real level when the caller provides one; otherwise a smooth
  // synthetic level while listening, so the orb still feels alive in
  // preview/demo contexts. Driven through a motion value (not React
  // state) so this never triggers a re-render.
  const level = useMotionValue(audioLevel ?? 0);

  useEffect(() => {
    if (audioLevel !== undefined) {
      level.set(Math.min(1, Math.max(0, audioLevel)));
    }
  }, [audioLevel, level]);

  useAnimationFrame((elapsedMs) => {
    if (
      audioLevel !== undefined ||
      state !== "listening" ||
      prefersReducedMotion
    ) {
      return;
    }

    const t = elapsedMs / 1000;
    const synthetic =
      0.35 +
      0.25 * Math.sin(t * 1.3) +
      0.15 * Math.sin(t * 0.7 + 1.3);

    level.set(Math.min(1, Math.max(0, synthetic)));
  });

  const smoothedLevel = useSpring(level, {
    stiffness: 110,
    damping: 18,
    mass: 0.6,
  });

  const levelScale = useTransform(smoothedLevel, [0, 1], [1, 1.16]);
  const rippleScale = useTransform(smoothedLevel, [0, 1], [1, 1.85]);
  const rippleOpacity = useTransform(
    smoothedLevel,
    [0.25, 0.6, 1],
    [0, 0.22, 0.42]
  );

  const ringSeconds = RING_ROTATION_SECONDS[state];
  const ringOpacity = RING_OPACITY[state];
  const [breathFrom, breathTo] = CORE_BREATH_SCALE[state];
  const showParticles = state === "thinking" && !prefersReducedMotion;
  const showRipple = state === "listening" && !prefersReducedMotion;

  const themeClass =
    darkMode === true ? "dark" : darkMode === false ? "light" : "";

  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center ${themeClass} ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="overflow-visible"
      >
        <defs>
          <radialGradient id={`${gradientId}-core`} cx="35%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="35%" stopColor="var(--accent-cyan)" stopOpacity="0.95" />
            <stop offset="70%" stopColor="var(--accent-violet)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="var(--accent-violet)" stopOpacity="0.4" />
          </radialGradient>

          <linearGradient id={`${gradientId}-ring`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--accent-violet)" />
            <stop offset="55%" stopColor="var(--accent-cyan)" />
            <stop offset="100%" stopColor="var(--accent-violet)" />
          </linearGradient>

          <filter id={`${gradientId}-blur-lg`} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="5.5" />
          </filter>

          <filter id={`${gradientId}-blur-sm`} x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="1.1" />
          </filter>
        </defs>

        {/* Ambient glow */}
        <motion.circle
          cx="50"
          cy="50"
          r="27"
          fill={`url(#${gradientId}-core)`}
          filter={`url(#${gradientId}-blur-lg)`}
          animate={{ opacity: CORE_GLOW_OPACITY[state] }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />

        {/* Reactive ripple (listening only) */}
        {showRipple && (
          <motion.circle
            cx="50"
            cy="50"
            r="18"
            fill="none"
            stroke="var(--accent-cyan)"
            strokeWidth="0.6"
            style={{ scale: rippleScale, opacity: rippleOpacity }}
          />
        )}

        {/* Outer ring */}
        <motion.g
          style={{ transformOrigin: "50px 50px" }}
          animate={
            prefersReducedMotion
              ? { rotate: REDUCED_MOTION_ROTATION[state] }
              : { rotate: 360 }
          }
          transition={
            prefersReducedMotion
              ? { duration: 0.6, ease: "easeOut" }
              : {
                  duration: ringSeconds.outer,
                  repeat: Infinity,
                  ease: "linear",
                }
          }
        >
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke={`url(#${gradientId}-ring)`}
            strokeWidth="0.6"
            strokeDasharray="1.4 6.5"
            opacity={ringOpacity.outer}
          />
        </motion.g>

        {/* Middle ring, opposite direction */}
        <motion.g
          style={{ transformOrigin: "50px 50px" }}
          animate={
            prefersReducedMotion
              ? { rotate: -REDUCED_MOTION_ROTATION[state] }
              : { rotate: -360 }
          }
          transition={
            prefersReducedMotion
              ? { duration: 0.6, ease: "easeOut" }
              : {
                  duration: ringSeconds.middle,
                  repeat: Infinity,
                  ease: "linear",
                }
          }
        >
          <circle
            cx="50"
            cy="50"
            r="34"
            fill="none"
            stroke={`url(#${gradientId}-ring)`}
            strokeWidth="0.8"
            opacity={ringOpacity.middle}
          />

          {showParticles && (
            <circle
              cx="50"
              cy="16"
              r="1.4"
              fill="var(--accent-cyan)"
              filter={`url(#${gradientId}-blur-sm)`}
            />
          )}
        </motion.g>

        {/* Inner ring */}
        <motion.g
          style={{ transformOrigin: "50px 50px" }}
          animate={
            prefersReducedMotion
              ? { rotate: REDUCED_MOTION_ROTATION[state] }
              : { rotate: 360 }
          }
          transition={
            prefersReducedMotion
              ? { duration: 0.6, ease: "easeOut" }
              : {
                  duration: ringSeconds.inner,
                  repeat: Infinity,
                  ease: "linear",
                }
          }
        >
          <circle
            cx="50"
            cy="50"
            r="24"
            fill="none"
            stroke={`url(#${gradientId}-ring)`}
            strokeWidth="1"
            opacity={ringOpacity.inner}
          />

          {showParticles && (
            <circle
              cx="74"
              cy="50"
              r="1.1"
              fill="var(--accent-violet)"
              filter={`url(#${gradientId}-blur-sm)`}
            />
          )}
        </motion.g>

        {/* Core orb */}
        <motion.circle
          cx="50"
          cy="50"
          r="12.5"
          fill={`url(#${gradientId}-core)`}
          style={
            state === "listening" ? { scale: levelScale } : undefined
          }
          animate={
            prefersReducedMotion
              ? { scale: REDUCED_MOTION_SCALE[state] }
              : state === "listening"
                ? undefined
                : { scale: [breathFrom, breathTo, breathFrom] }
          }
          transition={
            prefersReducedMotion
              ? { duration: 0.5, ease: "easeOut" }
              : {
                  duration: CORE_BREATH_SECONDS[state],
                  repeat: Infinity,
                  ease: "easeInOut",
                }
          }
        />
      </svg>
    </div>
  );
}
