"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { detectConflicts } from "../api/ai-coach/lib/voice-plan/conflicts";
import type {
  ExistingEventSnapshot,
  ParsedPlanItem,
  PlanItemWithConflicts,
} from "../api/ai-coach/lib/voice-plan/types";
import type {
  EventCategory,
  TaskPriority,
} from "../api/ai-coach/lib/types";

const categories: EventCategory[] = [
  "Personal",
  "Work",
  "Health",
  "Fitness",
  "Other",
];

const priorities: TaskPriority[] = ["low", "medium", "high"];

function stripConflicts(item: PlanItemWithConflicts): ParsedPlanItem {
  return {
    type: item.type,
    title: item.title,
    date: item.date,
    start_time: item.start_time,
    end_time: item.end_time,
    time_is_approximate: item.time_is_approximate,
    category: item.category,
    priority: item.priority,
  };
}

function formatConflictTime(start: string, end: string | null) {
  return end ? `${start}–${end}` : start;
}

type VoicePlanPreviewProps = {
  transcript: string;
  initialItems: PlanItemWithConflicts[];
  existingEvents: ExistingEventSnapshot[];
  onConfirmed: (summary: {
    createdCount: number;
    skippedCount: number;
    failedCount: number;
    failedTitles: string[];
  }) => void;
  onCancel: () => void;
};

export default function VoicePlanPreview({
  transcript,
  initialItems,
  existingEvents,
  onConfirmed,
  onCancel,
}: VoicePlanPreviewProps) {
  const [items, setItems] = useState<ParsedPlanItem[]>(() =>
    initialItems.map(stripConflicts)
  );
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState("");

  // Recomputed on every render from current (possibly edited) items —
  // pure, synchronous, client-side interval math, no server round trip
  // per the plan. existingEvents is the read-only snapshot the parse
  // response already included for exactly this purpose.
  const itemsWithConflicts = useMemo(
    () => detectConflicts(items, existingEvents),
    [items, existingEvents]
  );

  function updateItem(index: number, patch: Partial<ParsedPlanItem>) {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item
      )
    );
  }

  function removeItem(index: number) {
    setItems((current) =>
      current.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  function toggleType(index: number) {
    setItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        if (item.type === "task") {
          return {
            ...item,
            type: "event",
            start_time: item.start_time ?? "09:00",
            time_is_approximate: false,
          };
        }

        return {
          ...item,
          type: "task",
          start_time: null,
          end_time: null,
          time_is_approximate: false,
        };
      })
    );
  }

  async function handleConfirm() {
    if (items.length === 0 || confirming) {
      return;
    }

    setConfirming(true);
    setConfirmError("");

    try {
      const response = await fetch("/api/ai-coach/voice-plan/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items }),
      });

      const data = (await response.json()) as {
        status?: string;
        created?: unknown[];
        skippedCount?: number;
        failedCount?: number;
        failedTitles?: string[];
        error?: string;
      };

      if (!response.ok || data.status !== "ok") {
        throw new Error(
          data.error || "Orenios could not save your plan."
        );
      }

      onConfirmed({
        createdCount: data.created?.length ?? 0,
        skippedCount: data.skippedCount ?? 0,
        failedCount: data.failedCount ?? 0,
        failedTitles: data.failedTitles ?? [],
      });
    } catch (error) {
      setConfirmError(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving your plan."
      );
    } finally {
      setConfirming(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 rounded-3xl border border-accent-violet/20 bg-accent-violet/[0.04] p-4 sm:p-6"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">
        Here&apos;s what I heard
      </p>

      <p className="mt-2 text-sm leading-6 text-foreground/50">
        &ldquo;{transcript}&rdquo;
      </p>

      <div className="mt-5 space-y-3">
        {itemsWithConflicts.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-muted-border bg-muted px-4 py-6 text-center text-sm text-foreground/40">
            Nothing left to add — remove more items or cancel.
          </p>
        ) : (
          itemsWithConflicts.map((item, index) => {
            const hasConflicts = item.conflicts.length > 0;

            return (
              <div
                key={index}
                className={`rounded-2xl border p-4 ${
                  hasConflicts
                    ? "border-amber-300 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10"
                    : "border-card-border bg-card"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="text"
                    value={item.title}
                    onChange={(event) =>
                      updateItem(index, { title: event.target.value })
                    }
                    aria-label="Item title"
                    className="h-11 min-w-0 flex-1 rounded-xl border border-muted-border bg-muted px-3 text-sm font-medium text-foreground outline-none transition focus:border-accent-violet/40 focus:ring-4 focus:ring-accent-violet/10"
                  />

                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    aria-label={`Remove "${item.title}"`}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-foreground/30 transition hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleType(index)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.06em] transition ${
                      item.type === "event"
                        ? "border-accent-violet/30 bg-accent-violet/15 text-accent-violet"
                        : "border-muted-border bg-muted text-foreground/60"
                    }`}
                  >
                    {item.type === "event" ? "Event" : "Task"}
                  </button>

                  <span className="text-[11px] text-foreground/30">
                    tap to switch
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <label className="col-span-2 sm:col-span-1">
                    <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground/40">
                      Date
                    </span>

                    <input
                      type="date"
                      value={item.date}
                      onChange={(event) =>
                        updateItem(index, { date: event.target.value })
                      }
                      className="h-10 w-full rounded-xl border border-muted-border bg-muted px-2 text-xs text-foreground outline-none transition focus:border-accent-violet/40 focus:ring-4 focus:ring-accent-violet/10"
                    />
                  </label>

                  {item.type === "event" ? (
                    <>
                      <label>
                        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground/40">
                          Start
                        </span>

                        <input
                          type="time"
                          value={item.start_time ?? ""}
                          onChange={(event) =>
                            updateItem(index, {
                              start_time: event.target.value || null,
                            })
                          }
                          className="h-10 w-full rounded-xl border border-muted-border bg-muted px-2 text-xs text-foreground outline-none transition focus:border-accent-violet/40 focus:ring-4 focus:ring-accent-violet/10"
                        />
                      </label>

                      <label>
                        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground/40">
                          End
                        </span>

                        <input
                          type="time"
                          value={item.end_time ?? ""}
                          onChange={(event) =>
                            updateItem(index, {
                              end_time: event.target.value || null,
                            })
                          }
                          className="h-10 w-full rounded-xl border border-muted-border bg-muted px-2 text-xs text-foreground outline-none transition focus:border-accent-violet/40 focus:ring-4 focus:ring-accent-violet/10"
                        />
                      </label>

                      <label>
                        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground/40">
                          Category
                        </span>

                        <select
                          value={item.category}
                          onChange={(event) =>
                            updateItem(index, {
                              category: event.target
                                .value as EventCategory,
                            })
                          }
                          className="h-10 w-full rounded-xl border border-muted-border bg-muted px-2 text-xs text-foreground outline-none transition focus:border-accent-violet/40 focus:ring-4 focus:ring-accent-violet/10"
                        >
                          {categories.map((option) => (
                            <option
                              key={option}
                              value={option}
                              className="bg-background text-foreground"
                            >
                              {option}
                            </option>
                          ))}
                        </select>
                      </label>
                    </>
                  ) : (
                    <label className="col-span-2 sm:col-span-3">
                      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground/40">
                        Priority
                      </span>

                      <select
                        value={item.priority}
                        onChange={(event) =>
                          updateItem(index, {
                            priority: event.target
                              .value as TaskPriority,
                          })
                        }
                        className="h-10 w-full rounded-xl border border-muted-border bg-muted px-2 text-xs text-foreground outline-none transition focus:border-accent-violet/40 focus:ring-4 focus:ring-accent-violet/10"
                      >
                        {priorities.map((option) => (
                          <option
                            key={option}
                            value={option}
                            className="bg-background text-foreground"
                          >
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>

                {hasConflicts && (
                  <div className="mt-3 space-y-1">
                    {item.conflicts.map((conflict, conflictIndex) => (
                      <p
                        key={conflictIndex}
                        className="text-xs font-medium text-amber-700 dark:text-amber-300"
                      >
                        Overlaps with &ldquo;{conflict.title}&rdquo;{" "}
                        {formatConflictTime(
                          conflict.start_time,
                          conflict.end_time
                        )}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {confirmError && (
        <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          {confirmError}
        </p>
      )}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={items.length === 0 || confirming}
          className="cta-gradient flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(124,111,240,0.3)] transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          {confirming ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Saving...
            </>
          ) : (
            `Confirm & add ${items.length} ${
              items.length === 1 ? "item" : "items"
            }`
          )}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={confirming}
          className="h-12 rounded-2xl border border-muted-border bg-muted px-5 text-sm font-semibold text-foreground/60 transition hover:border-border-strong hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          Cancel
        </button>
      </div>
    </motion.div>
  );
}
