"use client";

import { AnimatePresence, motion } from "framer-motion";
import VoiceOrb, { type VoiceUIState } from "./VoiceOrb";
import AnimatedLogo from "../v2/AnimatedLogo";
import VoiceAura from "./VoiceAura";

// Roughly 1.5-2x the landing page's default spin — fast enough to read
// as "listening", without losing the calm, premium feel of the mark.
const LISTENING_LOGO_SPEED = 1.75;

export type { VoiceUIState } from "./VoiceOrb";

export type VoiceInterfaceProps = {
  state: VoiceUIState;
  // Populated once a real transcript/response exists. Neither is
  // required: today's integration has no live streaming transcript
  // while recording, and no text-to-speech "speaking" state at all —
  // this stays ready to receive both without any change here.
  transcript?: string;
  responseText?: string;
  audioLevel?: number;
  // The recorder's own MediaStream/AudioContext, reused by VoiceAura
  // for its AnalyserNode. Only meaningful while state === "listening";
  // harmless to leave undefined for every other state.
  mediaStream?: MediaStream | null;
  audioContext?: AudioContext | null;
  darkMode?: boolean;
  className?: string;
};

const STATUS_TEXT: Record<VoiceUIState, string> = {
  idle: "Tap the mic to speak",
  listening: "Listening…",
  thinking: "Thinking…",
  speaking: "Orenios is speaking",
};

export default function VoiceInterface({
  state,
  transcript,
  responseText,
  audioLevel,
  mediaStream = null,
  audioContext = null,
  darkMode,
  className = "",
}: VoiceInterfaceProps) {
  const bodyText = state === "speaking" ? responseText : transcript;

  return (
    <div
      className={`flex flex-col items-center rounded-3xl border border-accent-violet/20 bg-accent-violet/[0.04] px-6 py-8 text-center ${className}`}
    >
      {state === "listening" ? (
        // The same orbit logo used on the landing page / dashboard
        // corner, just spun faster — same geometry, same rings, same
        // satellites baked into the rotating artwork, so they can never
        // drift off their orbit. Every other state keeps the existing orb.
        // VoiceAura layers a voice-reactive glow behind it.
        <VoiceAura
          active={state === "listening"}
          mediaStream={mediaStream}
          audioContext={audioContext}
        >
          <AnimatedLogo
            speed={LISTENING_LOGO_SPEED}
            className="h-[132px] w-[132px]"
          />
        </VoiceAura>
      ) : (
        <VoiceOrb
          state={state}
          audioLevel={audioLevel}
          darkMode={darkMode}
          size={132}
        />
      )}

      <AnimatePresence mode="wait">
        <motion.p
          key={state}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="mt-5 text-sm font-medium tracking-[0.02em] text-foreground/70"
        >
          {STATUS_TEXT[state]}
        </motion.p>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {bodyText && (
          <motion.p
            key={bodyText}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="mt-3 max-w-sm text-sm leading-6 text-foreground/50"
          >
            &ldquo;{bodyText}&rdquo;
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
