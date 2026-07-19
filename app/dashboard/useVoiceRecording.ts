"use client";

import { useEffect, useRef, useState } from "react";
import { MAX_RECORDING_SECONDS } from "../api/ai-coach/lib/voice-plan/constants";
import type { VoiceUIState } from "../components/voice/VoiceInterface";
import type {
  ExistingEventSnapshot,
  PlanItemWithConflicts,
} from "../api/ai-coach/lib/voice-plan/types";

function getBrowserTimeZone() {
  try {
    const timeZone =
      Intl.DateTimeFormat()
        .resolvedOptions()
        .timeZone?.trim();

    return timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export function useVoiceRecording() {
  const [voiceRecordingState, setVoiceRecordingState] = useState<
    "idle" | "recording" | "processing"
  >("idle");
  const [voicePlanError, setVoicePlanError] = useState("");
  const [voiceSuccessMessage, setVoiceSuccessMessage] = useState("");
  const [voicePlanData, setVoicePlanData] = useState<{
    transcript: string;
    items: PlanItemWithConflicts[];
    existingEvents: ExistingEventSnapshot[];
  } | null>(null);

  // Maps the existing recording state machine onto the voice UI's
  // vocabulary. "speaking" has nothing to drive it yet (Orenios has no
  // text-to-speech output) — the orb component supports it for when
  // that exists, it's just never reached from here today.
  const voiceUIState: VoiceUIState =
    voiceRecordingState === "recording"
      ? "listening"
      : voiceRecordingState === "processing"
        ? "thinking"
        : "idle";

  // The current recording's MediaStream, reused (never re-requested) by
  // VoiceAura for its AnalyserNode. Populated the moment getUserMedia
  // resolves, cleared once the recorder actually stops.
  const [voiceStream, setVoiceStream] = useState<MediaStream | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimeoutRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  // Mirrors audioContextRef.current so consumers can read it during
  // render (VoiceAura needs it as a prop) — reading ref.current directly
  // in render isn't safe once the ref is returned across a hook
  // boundary like this one, so this state is the render-safe view of it.
  const [audioContext, setAudioContext] = useState<AudioContext | null>(
    null
  );
  // Set right before the MAX_RECORDING_SECONDS safety-net timeout calls
  // stopVoiceRecording, so recorder.onstop can tell that apart from the
  // user tapping the mic to stop and show a friendly note instead of
  // silently behaving as if nothing unusual happened.
  const autoStoppedRef = useRef(false);

  // Creates (or resumes) the AudioContext used by VoiceAura. Must be
  // called synchronously from inside the actual button-tap handler:
  // iOS Safari only unlocks an AudioContext when resume() runs inside a
  // user-gesture call stack — doing this later, e.g. in a useEffect
  // after state settles, can leave it permanently suspended on iOS.
  function ensureVoiceAudioContext(): AudioContext | null {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      const AudioContextCtor =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;

      if (!AudioContextCtor) {
        return null;
      }

      if (
        !audioContextRef.current ||
        audioContextRef.current.state === "closed"
      ) {
        audioContextRef.current = new AudioContextCtor();
      }

      const nextAudioContext = audioContextRef.current;

      if (nextAudioContext.state === "suspended") {
        void nextAudioContext.resume();
      }

      setAudioContext(nextAudioContext);

      return nextAudioContext;
    } catch (error) {
      console.error("Voice aura: could not create AudioContext", error);
      return null;
    }
  }

  function closeVoiceAudioContext() {
    const closingAudioContext = audioContextRef.current;
    audioContextRef.current = null;
    setAudioContext(null);

    if (closingAudioContext && closingAudioContext.state !== "closed") {
      void closingAudioContext.close().catch(() => {});
    }
  }

  useEffect(() => {
    return () => {
      closeVoiceAudioContext();
    };
  }, []);

  function getSupportedAudioMimeType() {
    if (typeof MediaRecorder === "undefined") {
      return null;
    }

    const candidates = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4",
      "audio/aac",
    ];

    for (const candidate of candidates) {
      if (MediaRecorder.isTypeSupported(candidate)) {
        return candidate;
      }
    }

    return null;
  }

  async function startVoiceRecording() {
    if (voiceRecordingState !== "idle" || voicePlanData) {
      return;
    }

    setVoicePlanError("");
    setVoiceSuccessMessage("");
    autoStoppedRef.current = false;

    // Synchronous, still inside this tap's gesture — see
    // ensureVoiceAudioContext's comment for why this can't move later.
    ensureVoiceAudioContext();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const mimeType = getSupportedAudioMimeType();

      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined
      );

      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        setVoiceStream(null);
        closeVoiceAudioContext();

        if (autoStoppedRef.current) {
          autoStoppedRef.current = false;
          setVoiceSuccessMessage(
            "That recording ran long, so I stopped it automatically — let's see what you've got."
          );
          window.setTimeout(() => setVoiceSuccessMessage(""), 6000);
        }

        const blob = new Blob(chunks, {
          type: mimeType || "audio/webm",
        });

        void processVoiceRecording(blob);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setVoiceStream(stream);
      setVoiceRecordingState("recording");

      recordingTimeoutRef.current = window.setTimeout(() => {
        autoStoppedRef.current = true;
        stopVoiceRecording();
      }, MAX_RECORDING_SECONDS * 1000);
    } catch {
      closeVoiceAudioContext();
      setVoicePlanError(
        "Microphone access was denied or unavailable. You can type your plan instead."
      );
    }
  }

  function stopVoiceRecording() {
    if (recordingTimeoutRef.current) {
      window.clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }

    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
  }

  async function processVoiceRecording(blob: Blob) {
    setVoiceRecordingState("processing");

    try {
      const formData = new FormData();
      formData.append("audio", blob, "voice-plan.webm");
      formData.append("timeZone", getBrowserTimeZone());

      const response = await fetch("/api/ai-coach/voice-plan", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as {
        status?: string;
        transcript?: string;
        items?: PlanItemWithConflicts[];
        existingEvents?: ExistingEventSnapshot[];
        error?: string;
      };

      if (!response.ok || data.status === "error") {
        throw new Error(
          data.error || "Orenios could not process your recording."
        );
      }

      if (data.status === "empty_transcript") {
        setVoicePlanError(
          "I couldn't hear anything clear in that recording — try again somewhere quieter, or type your plan instead."
        );
        return;
      }

      if (data.status === "no_items_found") {
        setVoicePlanError(
          `I heard "${data.transcript}" but didn't catch any specific plans in it — try again, or add things manually.`
        );
        return;
      }

      setVoicePlanData({
        transcript: data.transcript ?? "",
        items: data.items ?? [],
        existingEvents: data.existingEvents ?? [],
      });
    } catch (error) {
      setVoicePlanError(
        error instanceof Error
          ? error.message
          : "Something went wrong while processing your recording."
      );
    } finally {
      setVoiceRecordingState("idle");
    }
  }

  function handleVoicePlanConfirmed(summary: {
    createdCount: number;
    skippedCount: number;
  }) {
    setVoicePlanData(null);

    const itemWord = summary.createdCount === 1 ? "item" : "items";
    const skippedText =
      summary.skippedCount > 0
        ? ` (${summary.skippedCount} skipped as duplicates)`
        : "";

    setVoiceSuccessMessage(
      `✅ Added ${summary.createdCount} ${itemWord} to your workspace${skippedText}.`
    );

    window.setTimeout(() => setVoiceSuccessMessage(""), 4000);
  }

  function handleVoicePlanCancel() {
    setVoicePlanData(null);
  }

  return {
    voiceRecordingState,
    voiceUIState,
    voiceStream,
    audioContext,
    voicePlanError,
    voiceSuccessMessage,
    voicePlanData,
    startVoiceRecording,
    stopVoiceRecording,
    handleVoicePlanConfirmed,
    handleVoicePlanCancel,
  };
}
