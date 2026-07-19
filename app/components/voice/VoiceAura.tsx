"use client";

import { useEffect, useMemo, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type VoiceAuraState = "idle" | "thinking" | "listening";

export type VoiceAuraProps = {
  state: VoiceAuraState;
  // The same getUserMedia MediaStream the recorder already opened —
  // never requested again here. Only meaningful for "listening".
  mediaStream?: MediaStream | null;
  // Created (and resume()'d) by the caller inside the actual button tap
  // handler — see AICoach.tsx's ensureVoiceAudioContext. iOS Safari only
  // unlocks an AudioContext when resume() happens inside a user-gesture
  // handler, so that step can't live in this component's effect.
  audioContext?: AudioContext | null;
  // The logo's own rendered size in px — every glow/blob dimension is
  // derived proportionally from this, so the same component reads
  // right both as the small 44px button icon and the big 132px panel.
  size?: number;
  className?: string;
  children: React.ReactNode;
};

// --- iOS Safari fix ---------------------------------------------------
// Safari has a long-standing bug where a large filter: blur() on an
// absolutely-positioned layer gets rasterized and clipped to a hard
// rectangle instead of extending to let the blur fully dissipate — the
// exact "fog cut into a square" symptom this was built to fix. The safe
// pattern (confirmed working cross-browser): do the soft falloff with a
// multi-stop radial-gradient that already reaches full transparency
// well inside the element's own box, and skip blur() entirely rather
// than lean on it for softness. color-mix() gives alpha-blended stops
// from the CSS custom properties without hardcoding their hex values.
function glowGradient(color: "violet" | "cyan") {
  const c = `var(--accent-${color})`;
  return `radial-gradient(circle, color-mix(in srgb, ${c} 88%, transparent) 0%, color-mix(in srgb, ${c} 55%, transparent) 28%, color-mix(in srgb, ${c} 22%, transparent) 52%, transparent 76%)`;
}

const BLOB_GRADIENT: Record<"violet" | "cyan", string> = {
  violet: glowGradient("violet"),
  cyan: glowGradient("cyan"),
};

type Blob = {
  id: number;
  size: number;
  driftX: number;
  driftY: number;
  duration: number;
  delay: number;
  color: "violet" | "cyan";
};

function createBlobs(count: number, scale: number): Blob[] {
  const blobs: Blob[] = [];

  for (let i = 0; i < count; i += 1) {
    // Alternate a left-ish/right-ish bias per blob, then jitter within
    // that half — guarantees drift both directions without ever being
    // symmetric, and no two blobs (or two recording sessions) share
    // the same angle/distance/timing.
    const leftSide = i % 2 === 0;
    const baseAngleDeg = leftSide ? 180 : 0;
    const angleDeg = baseAngleDeg + (Math.random() - 0.5) * 100;
    const angleRad = (angleDeg * Math.PI) / 180;
    const distance = (0.55 + Math.random() * 0.75) * scale;

    blobs.push({
      id: i,
      size: (0.45 + Math.random() * 0.45) * scale,
      driftX: Math.cos(angleRad) * distance,
      driftY: Math.sin(angleRad) * distance * 0.6 - scale * 0.15,
      duration: 2.6 + Math.random() * 2.6,
      delay: Math.random() * 2.4,
      color: i % 2 === 0 ? "violet" : "cyan",
    });
  }

  return blobs;
}

// Fast attack, slow decay: rises toward a louder reading in a few
// frames, drifts back down over roughly half a second of silence so
// the aura breathes instead of flickering with every syllable.
const ATTACK = 0.35;
const DECAY = 0.92;

// getByteTimeDomainData RMS for normal speech sits well under 1.0 —
// scale it up into a more visually useful range before clamping.
const VOLUME_GAIN = 6;

// Slow idle oscillation blended in via max() so the intensity wrapper
// never looks completely dead during silence, without fighting the
// volume-driven value (it's simply overridden the moment real signal
// arrives).
const IDLE_BREATH_PERIOD_MS = 4200;
const IDLE_BREATH_STRENGTH = 0.25;

export default function VoiceAura({
  state,
  mediaStream = null,
  audioContext = null,
  size = 132,
  className = "",
  children,
}: VoiceAuraProps) {
  const prefersReducedMotion = useReducedMotion();
  const intensityRef = useRef<HTMLDivElement | null>(null);
  const smoothedVolumeRef = useRef(0);

  const blobs = useMemo(
    () => createBlobs(5, size * 1.1),
    // Re-rolled once per mount (i.e. once per fresh "listening" panel
    // instance), intentionally not per size change mid-session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const listening = state === "listening";

  useEffect(() => {
    if (
      !listening ||
      !mediaStream ||
      !audioContext ||
      prefersReducedMotion
    ) {
      return;
    }

    let cancelled = false;
    let rafId: number | null = null;
    let source: MediaStreamAudioSourceNode | null = null;
    let analyser: AnalyserNode | null = null;
    const intensityEl = intensityRef.current;

    try {
      source = audioContext.createMediaStreamSource(mediaStream);
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      // Deliberately not connected to audioContext.destination — this
      // is analysis-only, connecting to the output would feed the
      // user's own mic back through their speakers.
      source.connect(analyser);

      // getByteTimeDomainData wants a buffer sized to fftSize (the
      // waveform sample count), not frequencyBinCount (which is
      // fftSize / 2, meant for getByteFrequencyData instead).
      const data = new Uint8Array(analyser.fftSize);

      const tick = (timestampMs: number) => {
        if (cancelled || !analyser) {
          return;
        }

        analyser.getByteTimeDomainData(data);

        let sumSquares = 0;
        for (let i = 0; i < data.length; i += 1) {
          const normalized = (data[i] - 128) / 128;
          sumSquares += normalized * normalized;
        }
        const rms = Math.sqrt(sumSquares / data.length);
        const target = Math.min(1, rms * VOLUME_GAIN);

        const current = smoothedVolumeRef.current;
        smoothedVolumeRef.current =
          target > current
            ? current + (target - current) * ATTACK
            : current * DECAY;

        const idlePhase =
          (timestampMs / IDLE_BREATH_PERIOD_MS) * Math.PI * 2;
        const idleBreath =
          ((Math.sin(idlePhase) + 1) / 2) * IDLE_BREATH_STRENGTH;

        const level = Math.max(smoothedVolumeRef.current, idleBreath);

        if (intensityEl) {
          const scale = 0.85 + level * 0.55;
          const opacity = Math.min(1, 0.55 + level * 0.45);
          intensityEl.style.transform = `scale(${scale.toFixed(3)})`;
          intensityEl.style.opacity = opacity.toFixed(3);
        }

        rafId = requestAnimationFrame(tick);
      };

      rafId = requestAnimationFrame(tick);
    } catch (error) {
      // Graceful degrade: no analyser, no rAF loop — the blobs just
      // keep drifting at their default (non-intensity-boosted) style.
      console.error("Voice aura: audio analysis unavailable", error);
    }

    return () => {
      cancelled = true;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      source?.disconnect();
      analyser?.disconnect();
      smoothedVolumeRef.current = 0;
      if (intensityEl) {
        intensityEl.style.transform = "scale(1)";
        intensityEl.style.opacity = "1";
      }
    };
  }, [listening, mediaStream, audioContext, prefersReducedMotion]);

  const glowSize = size * 2.3;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
    >
      {state === "listening" && (
        <div
          ref={intensityRef}
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2"
        >
          {blobs.map((blob) => (
            <motion.div
              key={blob.id}
              className="absolute left-1/2 top-1/2 rounded-full"
              style={{
                width: blob.size,
                height: blob.size,
                marginLeft: -blob.size / 2,
                marginTop: -blob.size / 2,
                background: BLOB_GRADIENT[blob.color],
              }}
              initial={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
              animate={
                prefersReducedMotion
                  ? { x: 0, y: 0, opacity: 0.35, scale: 0.85 }
                  : {
                      x: [0, blob.driftX * 0.6, blob.driftX],
                      y: [0, blob.driftY * 0.6, blob.driftY],
                      opacity: [0, 0.55, 0],
                      scale: [0.5, 1, 0.35],
                    }
              }
              transition={
                prefersReducedMotion
                  ? { duration: 0.4 }
                  : {
                      duration: blob.duration,
                      delay: blob.delay,
                      repeat: Infinity,
                      ease: "easeOut",
                    }
              }
            />
          ))}
        </div>
      )}

      {state !== "listening" && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            className="absolute left-1/2 top-1/2 rounded-full"
            style={{
              width: glowSize,
              height: glowSize,
              marginLeft: -glowSize / 2,
              marginTop: -glowSize / 2,
              background: BLOB_GRADIENT.violet,
            }}
            animate={
              prefersReducedMotion
                ? { opacity: state === "thinking" ? 0.4 : 0.22 }
                : state === "thinking"
                  ? { opacity: [0.28, 0.5, 0.28], scale: [0.94, 1.04, 0.94] }
                  : { opacity: [0.16, 0.28, 0.16], scale: [0.97, 1.02, 0.97] }
            }
            transition={
              prefersReducedMotion
                ? { duration: 0.4 }
                : {
                    duration: state === "thinking" ? 1.6 : 4.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }
            }
          />
          <motion.div
            className="absolute left-1/2 top-1/2 rounded-full"
            style={{
              width: glowSize * 0.75,
              height: glowSize * 0.75,
              marginLeft: (-glowSize * 0.75) / 2,
              marginTop: (-glowSize * 0.75) / 2,
              background: BLOB_GRADIENT.cyan,
            }}
            animate={
              prefersReducedMotion
                ? { opacity: state === "thinking" ? 0.3 : 0.15 }
                : state === "thinking"
                  ? { opacity: [0.2, 0.38, 0.2] }
                  : { opacity: [0.1, 0.2, 0.1] }
            }
            transition={
              prefersReducedMotion
                ? { duration: 0.4 }
                : {
                    duration: state === "thinking" ? 1.9 : 5.1,
                    delay: state === "thinking" ? 0.3 : 1.1,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }
            }
          />
        </div>
      )}

      <motion.div
        className="relative z-10"
        animate={
          prefersReducedMotion
            ? { scale: 1 }
            : state === "idle"
              ? { scale: [1, 1.03, 1] }
              : { scale: 1 }
        }
        transition={
          prefersReducedMotion
            ? { duration: 0.4 }
            : { duration: 3.6, repeat: Infinity, ease: "easeInOut" }
        }
      >
        {children}
      </motion.div>
    </div>
  );
}
