"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createClient } from "../lib/supabase";
import VoicePlanPreview from "./VoicePlanPreview";
import VoiceOrb, { type VoiceUIState } from "../components/voice/VoiceOrb";
import VoiceInterface from "../components/voice/VoiceInterface";
import { MAX_RECORDING_SECONDS } from "../api/ai-coach/lib/voice-plan/constants";
import type {
  ExistingEventSnapshot,
  PlanItemWithConflicts,
} from "../api/ai-coach/lib/voice-plan/types";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
};

type StoredChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

const quickPrompts = [
  "Create a goal for this week",
  "Add a task for tomorrow",
  "Move a task to next week",
  "Mark today's top task as done",
];

function createMessageId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()}`;
}

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

function formatAssistantResponse(content: string) {
  const lines = content.split("\n");

  return lines.map((line, index) => {
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      return <div key={`space-${index}`} className="h-3" />;
    }

    const isHeading =
      trimmedLine.startsWith("🧠") ||
      trimmedLine.startsWith("🎯") ||
      trimmedLine.startsWith("📋") ||
      trimmedLine.startsWith("⚠️") ||
      trimmedLine.startsWith("💡");

    const isListItem =
      trimmedLine.startsWith("-") ||
      trimmedLine.startsWith("•") ||
      /^\d+\./.test(trimmedLine);

    if (isHeading) {
      return (
        <h3
          key={`${trimmedLine}-${index}`}
          className="mt-5 text-sm font-semibold text-foreground/90 first:mt-0"
        >
          {trimmedLine}
        </h3>
      );
    }

    if (isListItem) {
      return (
        <p
          key={`${trimmedLine}-${index}`}
          className="ml-2 mt-2 text-sm leading-6 text-foreground/60"
        >
          {trimmedLine}
        </p>
      );
    }

    return (
      <p
        key={`${trimmedLine}-${index}`}
        className="mt-2 text-sm leading-6 text-foreground/60"
      >
        {trimmedLine}
      </p>
    );
  });
}

export default function AICoach() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");

  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loading, setLoading] = useState(false);
  const [clearingConversation, setClearingConversation] =
    useState(false);

  const [errorMessage, setErrorMessage] = useState("");

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

  const conversationContainerRef =
    useRef<HTMLDivElement | null>(null);

  const hasConversation = messages.length > 0;

  const remainingCharacters = useMemo(
    () => 1000 - message.length,
    [message]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadConversationHistory() {
      setLoadingHistory(true);
      setErrorMessage("");

      try {
        const supabase = createClient();

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          throw new Error(
            "Your session has expired. Please sign in again."
          );
        }

        const { data, error } = await supabase
          .from("ai_messages")
          .select("id, role, content, created_at")
          .eq("user_id", user.id)
          .order("created_at", {
            ascending: false,
          })
          .limit(100);

        if (error) {
          throw error;
        }

        if (!cancelled) {
          setMessages(
            [...((data ?? []) as StoredChatMessage[])].reverse()
          );
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Orenios could not load your conversation."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingHistory(false);
        }
      }
    }

    void loadConversationHistory();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const container = conversationContainerRef.current;

    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function sendMessage(messageText: string) {
    const normalizedMessage = messageText.trim();

    if (
      !normalizedMessage ||
      loading ||
      loadingHistory ||
      clearingConversation
    ) {
      return;
    }

    setErrorMessage("");
    setLoading(true);
    setMessage("");

    const temporaryUserMessageId = createMessageId();

    const userMessage: ChatMessage = {
      id: temporaryUserMessageId,
      role: "user",
      content: normalizedMessage,
    };

    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
    ]);

    try {
      const response = await fetch("/api/ai-coach", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: normalizedMessage,
          timeZone: getBrowserTimeZone(),
        }),
      });

      const data = (await response.json()) as {
        reply?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Orenios could not generate a response."
        );
      }

      if (!data.reply?.trim()) {
        throw new Error(
          "Orenios returned an empty response."
        );
      }

      const assistantMessage: ChatMessage = {
        id: createMessageId(),
        role: "assistant",
        content: data.reply.trim(),
      };

      setMessages((currentMessages) => [
        ...currentMessages,
        assistantMessage,
      ]);
    } catch (error) {
      setMessages((currentMessages) =>
        currentMessages.filter(
          (chatMessage) =>
            chatMessage.id !== temporaryUserMessageId
        )
      );

      setMessage(normalizedMessage);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while contacting Orenios."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    void sendMessage(message);
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      void sendMessage(message);
    }
  }

  async function clearConversation() {
    if (
      loading ||
      loadingHistory ||
      clearingConversation
    ) {
      return;
    }

    setClearingConversation(true);
    setErrorMessage("");

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(
          "Your session has expired. Please sign in again."
        );
      }

      const { error } = await supabase
        .from("ai_messages")
        .delete()
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      setMessages([]);
      setMessage("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Orenios could not clear the conversation."
      );
    } finally {
      setClearingConversation(false);
    }
  }

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

      const audioContext = audioContextRef.current;

      if (audioContext.state === "suspended") {
        void audioContext.resume();
      }

      return audioContext;
    } catch (error) {
      console.error("Voice aura: could not create AudioContext", error);
      return null;
    }
  }

  function closeVoiceAudioContext() {
    const audioContext = audioContextRef.current;
    audioContextRef.current = null;

    if (audioContext && audioContext.state !== "closed") {
      void audioContext.close().catch(() => {});
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

  return (
    <section className="overflow-hidden rounded-3xl border border-card-border bg-card backdrop-blur-[12px]">
      {/* Always dark, regardless of the workspace theme toggle — same fixed
          brand-accent band as SectionPage/OverviewContent's hero. */}
      <div className="relative overflow-hidden border-b border-white/10 bg-surface-dark-card px-5 py-3 text-white sm:px-7 sm:py-5">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 -top-24 h-64 w-64 rounded-full bg-violet-600/35 blur-[90px]" />
          <div className="absolute -bottom-28 right-0 h-72 w-72 rounded-full bg-cyan-500/25 blur-[100px]" />
        </div>

        <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 2, -2, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-violet-300 ring-1 ring-white/10 backdrop-blur-xl"
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M12 3 13.6 8.4 19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />

                <path
                  d="m18.5 15 .7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3Z"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold tracking-[-0.03em]">
                  Orenios AI Coach
                </h2>

                <span className="rounded-full bg-violet-400/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-300">
                  AI
                </span>
              </div>

              <p className="mt-1 text-sm text-white/45">
                Your intelligent personal life assistant
              </p>
            </div>
          </div>

          {hasConversation && (
            <button
              type="button"
              onClick={() => void clearConversation()}
              disabled={
                loading ||
                loadingHistory ||
                clearingConversation
              }
              className="flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-semibold text-white/60 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {clearingConversation ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/10 border-t-white" />
                  Clearing...
                </>
              ) : (
                "New conversation"
              )}
            </button>
          )}
        </div>
      </div>

      <div className="bg-card p-4 sm:p-6">
        {loadingHistory ? (
          <div className="rounded-3xl border border-card-border bg-card px-5 py-14 text-center backdrop-blur-[12px]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-violet/15 text-accent-violet">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-accent-violet/25 border-t-accent-violet" />
            </div>

            <p className="mt-5 text-sm font-semibold text-foreground/80">
              Loading your conversation
            </p>

            <p className="mt-2 text-sm text-foreground/40">
              Orenios is restoring your recent messages.
            </p>
          </div>
        ) : !hasConversation ? (
          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="rounded-3xl border border-card-border bg-card px-5 py-4 text-center backdrop-blur-[12px] sm:px-6"
          >
            <h3 className="text-lg font-semibold tracking-[-0.03em] text-foreground">
              How can I help you today?
            </h3>

            <p className="mx-auto mt-1.5 hidden max-w-xl text-sm leading-6 text-foreground/50 sm:block">
              Ask Orenios to organize your priorities, build a plan or clarify a decision.
            </p>

            <div className="mx-auto mt-3 grid max-w-2xl grid-cols-2 gap-1.5 sm:mt-4 sm:gap-2">
              {quickPrompts.map((quickPrompt) => (
                <button
                  key={quickPrompt}
                  type="button"
                  onClick={() =>
                    void sendMessage(quickPrompt)
                  }
                  disabled={loading}
                  className="rounded-2xl border border-muted-border bg-muted px-3 py-2 text-left text-xs font-medium leading-5 text-foreground/70 transition hover:border-accent-violet/25 hover:bg-accent-violet/10 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-3 sm:text-sm"
                >
                  {quickPrompt}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <div
            ref={conversationContainerRef}
            className="max-h-[620px] space-y-5 overflow-y-auto rounded-3xl border border-card-border bg-card p-4 backdrop-blur-[12px] sm:p-6"
          >
            <AnimatePresence initial={false}>
              {messages.map((chatMessage) => {
                const isUser =
                  chatMessage.role === "user";

                return (
                  <motion.div
                    key={chatMessage.id}
                    layout
                    initial={{
                      opacity: 0,
                      y: 10,
                      scale: 0.99,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      y: -8,
                    }}
                    transition={{
                      duration: 0.25,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className={`flex ${
                      isUser
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[92%] rounded-3xl px-5 py-4 sm:max-w-[78%] ${
                        isUser
                          ? "rounded-br-md bg-accent-violet/20 text-foreground"
                          : "rounded-bl-md border border-card-border bg-muted text-foreground/70"
                      }`}
                    >
                      <div className="mb-3 flex items-center gap-2">
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-bold ${
                            isUser
                              ? "bg-surface-strong text-foreground"
                              : "bg-accent-violet/15 text-accent-violet"
                          }`}
                        >
                          {isUser ? "YOU" : "AI"}
                        </div>

                        <p
                          className={`text-xs font-semibold ${
                            isUser
                              ? "text-foreground/60"
                              : "text-foreground/40"
                          }`}
                        >
                          {isUser
                            ? "You"
                            : "Orenios AI"}
                        </p>
                      </div>

                      {isUser ? (
                        <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">
                          {chatMessage.content}
                        </p>
                      ) : (
                        <div>
                          {formatAssistantResponse(
                            chatMessage.content
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {loading && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="flex justify-start"
              >
                <div className="rounded-3xl rounded-bl-md border border-card-border bg-muted px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-violet/15 text-accent-violet">
                      <span className="text-sm">✦</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {[0, 1, 2].map((dot) => (
                        <motion.span
                          key={dot}
                          animate={{
                            opacity: [0.3, 1, 0.3],
                            y: [0, -3, 0],
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: dot * 0.15,
                          }}
                          className="h-2 w-2 rounded-full bg-accent-violet"
                        />
                      ))}
                    </div>

                    <p className="text-xs font-medium text-foreground/40">
                      Orenios is thinking...
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {errorMessage && (
          <motion.div
            initial={{
              opacity: 0,
              y: -5,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            role="alert"
            className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
          >
            {errorMessage}
          </motion.div>
        )}

        {voicePlanError && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            role="alert"
            className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
          >
            {voicePlanError}
          </motion.div>
        )}

        {voiceSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            role="status"
            className="mt-4 rounded-2xl border border-accent-mint/30 bg-accent-mint/10 px-4 py-3 text-sm leading-5 text-emerald-700 dark:text-accent-mint"
          >
            {voiceSuccessMessage}
          </motion.div>
        )}

        {voiceRecordingState !== "idle" && !voicePlanData && (
          <VoiceInterface
            state={voiceUIState}
            mediaStream={voiceStream}
            audioContext={audioContextRef.current}
            className="mt-4"
          />
        )}

        {voicePlanData ? (
          <VoicePlanPreview
            transcript={voicePlanData.transcript}
            initialItems={voicePlanData.items}
            existingEvents={voicePlanData.existingEvents}
            onConfirmed={handleVoicePlanConfirmed}
            onCancel={handleVoicePlanCancel}
          />
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-3 rounded-3xl border border-muted-border bg-muted p-3 backdrop-blur-[12px]"
          >
            <textarea
              value={message}
              onChange={(event) =>
                setMessage(
                  event.target.value.slice(0, 1000)
                )
              }
              onKeyDown={handleKeyDown}
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
                  Enter to send · Shift + Enter for a new
                  line
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    voiceRecordingState === "recording"
                      ? stopVoiceRecording()
                      : void startVoiceRecording()
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
                  <VoiceOrb state={voiceUIState} size={22} />
                </button>

                <motion.button
                  whileHover={
                    loading ||
                    loadingHistory ||
                    clearingConversation
                      ? undefined
                      : { scale: 1.015 }
                  }
                  whileTap={
                    loading ||
                    loadingHistory ||
                    clearingConversation
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
        )}

        <p className="mt-3 text-center text-[11px] leading-5 text-foreground/30">
          Orenios may make mistakes. Review important
          information before acting on it.
        </p>
      </div>
    </section>
  );
}
