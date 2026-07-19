"use client";

import { motion } from "framer-motion";
import type { FormEvent, KeyboardEvent } from "react";
import AnimatedLogo from "../components/v2/AnimatedLogo";
import VoiceAura from "../components/voice/VoiceAura";
import {
  type VoiceUIState,
  VOICE_AURA_STATE,
  VOICE_LOGO_SPEED,
} from "../components/voice/VoiceInterface";

type ChatInputFormProps = {
  message: string;
  onMessageChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  remainingCharacters: number;
  loading: boolean;
  loadingHistory: boolean;
  clearingConversation: boolean;
  voiceRecordingState: "idle" | "recording" | "processing";
  voiceUIState: VoiceUIState;
  voiceStream: MediaStream | null;
  audioContext: AudioContext | null;
  onStartRecording: () => void;
  onStopRecording: () => void;
};

export default function ChatInputForm({
  message,
  onMessageChange,
  onSubmit,
  onKeyDown,
  remainingCharacters,
  loading,
  loadingHistory,
  clearingConversation,
  voiceRecordingState,
  voiceUIState,
  voiceStream,
  audioContext,
  onStartRecording,
  onStopRecording,
}: ChatInputFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="mt-3 rounded-3xl border border-muted-border bg-muted p-3 backdrop-blur-[12px]"
    >
      <textarea
        value={message}
        onChange={(event) =>
          onMessageChange(event.target.value.slice(0, 1000))
        }
        onKeyDown={onKeyDown}
        placeholder="Ask Orenios to organize your day..."
        rows={3}
        disabled={
          loading ||
          loadingHistory ||
          clearingConversation ||
          voiceRecordingState !== "idle"
        }
        className="w-full resize-none bg-transparent px-3 py-2 text-sm leading-6 text-foreground outline-none placeholder:text-foreground/30 disabled:cursor-not-allowed disabled:opacity-60"
      />

      <div className="mt-2 flex flex-col gap-3 border-t border-card-border px-2 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <p
            className={`text-xs ${
              remainingCharacters < 100
                ? "text-orange-400"
                : "text-foreground/30"
            }`}
          >
            {voiceRecordingState === "recording"
              ? "Recording... tap the mic to stop"
              : voiceRecordingState === "processing"
                ? "Understanding your day..."
                : `${remainingCharacters} characters left`}
          </p>

          <p className="hidden text-xs text-foreground/20 sm:block">
            Enter to send · Shift + Enter for a new line
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              voiceRecordingState === "recording"
                ? onStopRecording()
                : onStartRecording()
            }
            disabled={
              voiceRecordingState === "processing" ||
              loading ||
              loadingHistory ||
              clearingConversation
            }
            aria-label={
              voiceRecordingState === "recording"
                ? "Stop recording"
                : voiceRecordingState === "processing"
                  ? "Processing your recording"
                  : "Record your day"
            }
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition disabled:cursor-not-allowed disabled:opacity-50 ${
              voiceRecordingState === "recording"
                ? "border-red-400 bg-red-500/10"
                : voiceRecordingState === "processing"
                  ? "border-accent-violet/40 bg-accent-violet/10"
                  : "border-muted-border bg-card hover:border-accent-violet/30"
            }`}
          >
            <VoiceAura
              state={VOICE_AURA_STATE[voiceUIState]}
              mediaStream={voiceStream}
              audioContext={audioContext}
              size={22}
            >
              <AnimatedLogo
                speed={VOICE_LOGO_SPEED[voiceUIState]}
                className="h-[22px] w-[22px]"
              />
            </VoiceAura>
          </button>

          <motion.button
            whileHover={
              loading || loadingHistory || clearingConversation
                ? undefined
                : { scale: 1.015 }
            }
            whileTap={
              loading || loadingHistory || clearingConversation
                ? undefined
                : { scale: 0.985 }
            }
            type="submit"
            disabled={
              loading ||
              loadingHistory ||
              clearingConversation ||
              !message.trim()
            }
            className="cta-gradient flex h-11 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(124,111,240,0.3)] transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Thinking...
              </>
            ) : (
              <>
                Ask Orenios
                <span aria-hidden="true">→</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </form>
  );
}
