"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

export type VoiceAuraProps = {
  // Only true while state === "listening". The aura's whole lifecycle
  // (analyser creation, rAF loop) is gated on this.
  active: boolean;
  // The same getUserMedia MediaStream the recorder already opened —
  // never requested again here.
  mediaStream: MediaStream | null;
  // Created (and resume()'d) by the caller inside the actual button tap
  // handler — see AICoach.tsx's ensureVoiceAudioContext. iOS Safari only
  // unlocks an AudioContext when resume() happens inside a user-gesture
  // handler, so that step can't live in this component's effect.
  audioContext: AudioContext | null;
  className?: string;
  children: React.ReactNode;
};

// Fast attack, slow decay: rises toward a louder reading in a few
// frames, drifts back down over roughly half a second of silence so
// the aura breathes instead of flickering with every syllable.
const ATTACK = 0.35;
const DECAY = 0.92;

// getByteTimeDomainData RMS for normal speech sits well under 1.0 —
// scale it up into a more visually useful range before clamping.
const VOLUME_GAIN = 6;

// Slow idle oscillation blended in via max() so the aura never looks
// completely dead during silence, without fighting the volume-driven
// value (it's simply overridden the moment real signal arrives).
const IDLE_BREATH_PERIOD_MS = 4200;
const IDLE_BREATH_STRENGTH = 0.13;

type Layer = {
  baseScale: number;
  scaleBoost: number;
  baseOpacity: number;
  opacityBoost: number;
};

const LAYERS: Layer[] = [
  // Innermost — tightest, most responsive.
  { baseScale: 1, scaleBoost: 0.3, baseOpacity: 0.4, opacityBoost: 0.35 },
  // Mid layer.
  { baseScale: 0.96, scaleBoost: 0.5, baseOpacity: 0.24, opacityBoost: 0.3 },
  // Outer mist — largest swing, softest.
  { baseScale: 0.92, scaleBoost: 0.8, baseOpacity: 0.15, opacityBoost: 0.24 },
];

const LAYER_SIZES = ["180px", "232px", "300px"];
const LAYER_BLUR = ["blur-xl", "blur-2xl", "blur-3xl"];
const LAYER_COLOR = [
  "var(--accent-violet)",
  "var(--accent-cyan)",
  "var(--accent-violet)",
];

export default function VoiceAura({
  active,
  mediaStream,
  audioContext,
  className = "",
  children,
}: VoiceAuraProps) {
  const prefersReducedMotion = useReducedMotion();
  const layerRefs = [
    useRef<HTMLDivElement | null>(null),
    useRef<HTMLDivElement | null>(null),
    useRef<HTMLDivElement | null>(null),
  ];
  const smoothedVolumeRef = useRef(0);

  useEffect(() => {
    if (!active || !mediaStream || !audioContext || prefersReducedMotion) {
      return;
    }

    let cancelled = false;
    let rafId: number | null = null;
    let source: MediaStreamAudioSourceNode | null = null;
    let analyser: AnalyserNode | null = null;

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

        layerRefs.forEach((ref, index) => {
          const el = ref.current;
          if (!el) {
            return;
          }
          const layer = LAYERS[index];
          const scale = layer.baseScale + level * layer.scaleBoost;
          const opacity = Math.min(
            1,
            layer.baseOpacity + level * layer.opacityBoost
          );
          el.style.transform = `scale(${scale.toFixed(3)})`;
          el.style.opacity = opacity.toFixed(3);
        });

        rafId = requestAnimationFrame(tick);
      };

      rafId = requestAnimationFrame(tick);
    } catch (error) {
      // Graceful degrade: no analyser, no rAF loop — the layers just
      // keep whatever static resting style is set in the JSX below.
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
      layerRefs.forEach((ref, index) => {
        const el = ref.current;
        if (!el) {
          return;
        }
        const layer = LAYERS[index];
        el.style.transform = `scale(${layer.baseScale})`;
        el.style.opacity = String(layer.baseOpacity);
      });
    };
    // layerRefs are stable ref objects created once per mount; omitting
    // them from deps is intentional (identical to the ESLint-approved
    // pattern of ref arrays not needing to retrigger effects).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, mediaStream, audioContext, prefersReducedMotion]);

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2">
        {LAYERS.map((layer, index) => (
          <div
            key={index}
            ref={layerRefs[index]}
            className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full ${LAYER_BLUR[index]}`}
            style={{
              width: LAYER_SIZES[index],
              height: LAYER_SIZES[index],
              background: `radial-gradient(circle, ${LAYER_COLOR[index]} 0%, transparent 70%)`,
              opacity: layer.baseOpacity,
              transform: `scale(${layer.baseScale})`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
}
