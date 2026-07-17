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
          className="mt-5 text-sm font-semibold text-white/90 first:mt-0"
        >
          {trimmedLine}
        </h3>
      );
    }

    if (isListItem) {
      return (
        <p
          key={`${trimmedLine}-${index}`}
          className="ml-2 mt-2 text-sm leading-6 text-white/60"
        >
          {trimmedLine}
        </p>
      );
    }

    return (
      <p
        key={`${trimmedLine}-${index}`}
        className="mt-2 text-sm leading-6 text-white/60"
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
    <section className="overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-[12px]">
      <div className="relative overflow-hidden border-b border-white/10 bg-surface-dark-card px-5 py-6 text-white sm:px-7 sm:py-7">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 -top-24 h-64 w-64 rounded-full bg-violet-600/35 blur-[90px]" />
          <div className="absolute -bottom-28 right-0 h-72 w-72 rounded-full bg-cyan-500/25 blur-[100px]" />
        </div>

        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
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
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-violet-300 ring-1 ring-white/10 backdrop-blur-xl"
            >
              <svg
                width="25"
                height="25"
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
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/25 border-t-white" />
                  Clearing...
                </>
              ) : (
                "New conversation"
              )}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white/[0.015] p-4 sm:p-6">
        {loadingHistory ? (
          <div className="rounded-3xl border border-white/[0.06] bg-white/[0.03] px-5 py-14 text-center backdrop-blur-[12px]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-violet/15 text-accent-violet">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-accent-violet/25 border-t-accent-violet" />
            </div>

            <p className="mt-5 text-sm font-semibold text-white/80">
              Loading your conversation
            </p>

            <p className="mt-2 text-sm text-white/40">
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
            className="rounded-3xl border border-white/[0.06] bg-white/[0.03] px-5 py-10 text-center backdrop-blur-[12px] sm:px-8"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-violet/15 text-accent-violet">
              <svg
                width="28"
                height="28"
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
              </svg>
            </div>

            <h3 className="mt-6 text-2xl font-semibold tracking-[-0.04em] text-white">
              How can I help you today?
            </h3>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/50">
              Ask Orenios to organize your priorities,
              build an action plan, improve your focus or
              help you make a clearer decision.
            </p>

            <div className="mx-auto mt-7 grid max-w-2xl gap-3 sm:grid-cols-2">
              {quickPrompts.map((quickPrompt) => (
                <button
                  key={quickPrompt}
                  type="button"
                  onClick={() =>
                    void sendMessage(quickPrompt)
                  }
                  disabled={loading}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left text-sm font-medium text-white/70 transition hover:border-accent-violet/25 hover:bg-accent-violet/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {quickPrompt}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <div
            ref={conversationContainerRef}
            className="max-h-[620px] space-y-5 overflow-y-auto rounded-3xl border border-white/[0.06] bg-white/[0.03] p-4 backdrop-blur-[12px] sm:p-6"
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
                          ? "rounded-br-md bg-accent-violet/20 text-white"
                          : "rounded-bl-md border border-white/[0.06] bg-white/[0.04] text-white/70"
                      }`}
                    >
                      <div className="mb-3 flex items-center gap-2">
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-bold ${
                            isUser
                              ? "bg-white/10 text-white"
                              : "bg-accent-violet/15 text-accent-violet"
                          }`}
                        >
                          {isUser ? "YOU" : "AI"}
                        </div>

                        <p
                          className={`text-xs font-semibold ${
                            isUser
                              ? "text-white/60"
                              : "text-white/40"
                          }`}
                        >
                          {isUser
                            ? "You"
                            : "Orenios AI"}
                        </p>
                      </div>

                      {isUser ? (
                        <p className="whitespace-pre-wrap text-sm leading-6 text-white">
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
                <div className="rounded-3xl rounded-bl-md border border-white/[0.06] bg-white/[0.04] px-5 py-4">
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

                    <p className="text-xs font-medium text-white/40">
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
            className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm leading-5 text-red-300"
          >
            {errorMessage}
          </motion.div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-4 rounded-3xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-[12px]"
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
              clearingConversation
            }
            className="w-full resize-none bg-transparent px-3 py-2 text-sm leading-6 text-white outline-none placeholder:text-white/30 disabled:cursor-not-allowed disabled:opacity-60"
          />

          <div className="mt-2 flex flex-col gap-3 border-t border-white/[0.06] px-2 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <p
                className={`text-xs ${
                  remainingCharacters < 100
                    ? "text-orange-400"
                    : "text-white/30"
                }`}
              >
                {remainingCharacters} characters left
              </p>

              <p className="hidden text-xs text-white/20 sm:block">
                Enter to send · Shift + Enter for a new
                line
              </p>
            </div>

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
        </form>

        <p className="mt-3 text-center text-[11px] leading-5 text-white/30">
          Orenios may make mistakes. Review important
          information before acting on it.
        </p>
      </div>
    </section>
  );
}
