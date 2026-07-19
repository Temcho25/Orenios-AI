"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { RefObject } from "react";
import { formatAssistantResponse } from "./lib/formatAssistantResponse";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
};

const quickPrompts = [
  "Create a goal for this week",
  "Add a task for tomorrow",
  "Move a task to next week",
  "Mark today's top task as done",
];

type ChatMessageListProps = {
  loadingHistory: boolean;
  hasConversation: boolean;
  messages: ChatMessage[];
  loading: boolean;
  onQuickPrompt: (prompt: string) => void;
  conversationContainerRef: RefObject<HTMLDivElement | null>;
};

export default function ChatMessageList({
  loadingHistory,
  hasConversation,
  messages,
  loading,
  onQuickPrompt,
  conversationContainerRef,
}: ChatMessageListProps) {
  if (loadingHistory) {
    return (
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
    );
  }

  if (!hasConversation) {
    return (
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
              onClick={() => onQuickPrompt(quickPrompt)}
              disabled={loading}
              className="rounded-2xl border border-muted-border bg-muted px-3 py-2 text-left text-xs font-medium leading-5 text-foreground/70 transition hover:border-accent-violet/25 hover:bg-accent-violet/10 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-3 sm:text-sm"
            >
              {quickPrompt}
            </button>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <div
      ref={conversationContainerRef}
      className="max-h-[620px] space-y-5 overflow-y-auto rounded-3xl border border-card-border bg-card p-4 backdrop-blur-[12px] sm:p-6"
    >
      <AnimatePresence initial={false}>
        {messages.map((chatMessage) => {
          const isUser = chatMessage.role === "user";

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
                isUser ? "justify-end" : "justify-start"
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
                    {isUser ? "You" : "Orenios AI"}
                  </p>
                </div>

                {isUser ? (
                  <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">
                    {chatMessage.content}
                  </p>
                ) : (
                  <div>{formatAssistantResponse(chatMessage.content)}</div>
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
  );
}
