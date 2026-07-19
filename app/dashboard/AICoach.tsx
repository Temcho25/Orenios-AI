"use client";

import { motion } from "framer-motion";
import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "../lib/supabase";
import VoicePlanPreview from "./VoicePlanPreview";
import VoiceInterface from "../components/voice/VoiceInterface";
import ChatMessageList from "./ChatMessageList";
import ChatInputForm from "./ChatInputForm";
import { useVoiceRecording } from "./useVoiceRecording";

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

export default function AICoach() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");

  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loading, setLoading] = useState(false);
  const [clearingConversation, setClearingConversation] =
    useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const {
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
  } = useVoiceRecording();

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
        <ChatMessageList
          loadingHistory={loadingHistory}
          hasConversation={hasConversation}
          messages={messages}
          loading={loading}
          onQuickPrompt={(prompt) => void sendMessage(prompt)}
          conversationContainerRef={conversationContainerRef}
        />

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
            audioContext={audioContext}
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
          <ChatInputForm
            message={message}
            onMessageChange={setMessage}
            onSubmit={handleSubmit}
            onKeyDown={handleKeyDown}
            remainingCharacters={remainingCharacters}
            loading={loading}
            loadingHistory={loadingHistory}
            clearingConversation={clearingConversation}
            voiceRecordingState={voiceRecordingState}
            voiceUIState={voiceUIState}
            voiceStream={voiceStream}
            audioContext={audioContext}
            onStartRecording={() => void startVoiceRecording()}
            onStopRecording={stopVoiceRecording}
          />
        )}

        <p className="mt-3 text-center text-[11px] leading-5 text-foreground/30">
          Orenios may make mistakes. Review important
          information before acting on it.
        </p>
      </div>
    </section>
  );
}
