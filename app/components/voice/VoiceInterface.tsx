"use client";

import { AnimatePresence, motion } from "framer-motion";
import AnimatedLogo from "../v2/AnimatedLogo";
import VoiceAura, { type VoiceAuraState } from "./VoiceAura";

export type VoiceUIState = "idle" | "listening" | "thinking" | "speaking";

// Logo spin speed per state, relative to the landing page's default
// (1 = identical to every other AnimatedLogo caller). "speaking" isn't
// reachable today (Orenios has no text-to-speech output yet) — it's
// mapped the same as "thinking" so the component stays correct if
// that ever changes, without needing a new preset.
export const VOICE_LOGO_SPEED: Record<VoiceUIState, number> = {
  idle: 1,
  listening: 1.75,
  thinking: 2.75,
  speaking: 2.75,
};

export const VOICE_AURA_STATE: Record<VoiceUIState, VoiceAuraState> = {
  idle: "idle",
  listening: "listening",
  thinking: "thinking",
  speaking: "thinking",
};

export type VoiceInterfaceProps = {
  state: VoiceUIState;
  // Populated once a real transcript/response exists. Neither is
  // required: today's integration has no live streaming transcript
  // while recording, and no text-to-speech "speaking" state at all —
  // this stays ready to receive both without any change here.
  transcript?: string;
  responseText?: string;
  // The recorder's own MediaStream/AudioContext, reused by VoiceAura
  // for its AnalyserNode. Only meaningful while state === "listening";
  // harmless to leave undefined for every other state.
  mediaStream?: MediaStream | null;
  audioContext?: AudioContext | null;
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
  mediaStream = null,
  audioContext = null,
  className = "",
}: VoiceInterfaceProps) {
  const bodyText = state === "speaking" ? responseText : transcript;

  return (
    <div
      className={`flex flex-col items-center rounded-3xl border border-accent-violet/20 bg-accent-violet/[0.04] px-6 py-8 text-center ${className}`}
    >
      {/* The same orbit logo used on the landing page / dashboard
          corner, at a state-appropriate spin speed — same geometry,
          same rings, same satellites baked into the rotating artwork,
          so they can never drift off their orbit. VoiceAura layers a
          state-appropriate glow behind it (voice-reactive mist while
          listening, a calmer pulse otherwise). */}
      <VoiceAura
        state={VOICE_AURA_STATE[state]}
        mediaStream={mediaStream}
        audioContext={audioContext}
        size={132}
      >
        <AnimatedLogo
          speed={VOICE_LOGO_SPEED[state]}
          className="h-[132px] w-[132px]"
        />
      </VoiceAura>

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
