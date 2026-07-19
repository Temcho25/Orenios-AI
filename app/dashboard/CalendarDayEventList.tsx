"use client";

import { AnimatePresence, motion } from "framer-motion";
import { formatTime, getCategoryClasses } from "./lib/calendar-helpers";
import type { CalendarEvent } from "./CalendarCard";

type CalendarDayEventListProps = {
  loadingEvents: boolean;
  selectedDateEvents: CalendarEvent[];
  pendingEventIds: string[];
  onDelete: (calendarEvent: CalendarEvent) => void;
};

export default function CalendarDayEventList({
  loadingEvents,
  selectedDateEvents,
  pendingEventIds,
  onDelete,
}: CalendarDayEventListProps) {
  return (
    <div className="mt-5 space-y-3">
      {loadingEvents ? (
        [1, 2].map((item) => (
          <div
            key={item}
            className="flex animate-pulse items-center gap-4 rounded-2xl border border-card-border bg-card px-4 py-4"
          >
            <div className="h-10 w-10 rounded-xl bg-surface-strong" />
            <div className="flex-1">
              <div className="h-4 w-40 rounded-full bg-surface-strong" />
              <div className="mt-2 h-3 w-24 rounded-full bg-muted" />
            </div>
          </div>
        ))
      ) : selectedDateEvents.length > 0 ? (
        <AnimatePresence initial={false}>
          {selectedDateEvents.map((calendarEvent) => {
            const eventPending = pendingEventIds.includes(
              calendarEvent.id
            );

            return (
              <motion.article
                key={calendarEvent.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{
                  opacity: eventPending ? 0.6 : 1,
                  y: 0,
                }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-start gap-4 rounded-2xl border border-card-border bg-card px-4 py-4 backdrop-blur-[12px] transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-violet/25 hover:bg-muted hover:shadow-[0_20px_45px_-15px_rgba(124,111,240,0.35)]"
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-xs font-bold ${getCategoryClasses(
                    calendarEvent.category
                  )}`}
                >
                  {calendarEvent.start_time
                    ? formatTime(calendarEvent.start_time)
                    : "DAY"}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">
                      {calendarEvent.title}
                    </h3>

                    <span
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${getCategoryClasses(
                        calendarEvent.category
                      )}`}
                    >
                      {calendarEvent.category}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-foreground/40">
                    {calendarEvent.start_time
                      ? `${formatTime(calendarEvent.start_time)}${
                          calendarEvent.end_time
                            ? ` – ${formatTime(calendarEvent.end_time)}`
                            : ""
                        }`
                      : "All-day event"}
                  </p>

                  {calendarEvent.description && (
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground/50">
                      {calendarEvent.description}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onDelete(calendarEvent)}
                  disabled={eventPending}
                  aria-label={`Delete "${calendarEvent.title}"`}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-foreground/25 transition hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 disabled:cursor-wait"
                >
                  {eventPending ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-border-strong border-t-foreground/60" />
                  ) : (
                    <svg
                      width="17"
                      height="17"
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
                  )}
                </button>
              </motion.article>
            );
          })}
        </AnimatePresence>
      ) : (
        <div className="rounded-3xl border border-dashed border-muted-border bg-card px-6 py-9 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-violet/15 text-accent-violet">
            <span className="text-xl">+</span>
          </div>

          <p className="mt-4 text-sm font-semibold text-foreground/80">
            Your schedule is clear.
          </p>

          <p className="mt-2 text-sm text-foreground/40">
            Add an event when something important comes up.
          </p>
        </div>
      )}
    </div>
  );
}
