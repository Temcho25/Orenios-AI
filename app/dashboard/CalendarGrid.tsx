"use client";

import { motion } from "framer-motion";
import { getLocalDateKey } from "../lib/date-utils";
import type { EventCategory } from "../lib/event-category";
import {
  formatTime,
  getCategoryDot,
  isSameDay,
  type CalendarDay,
} from "./lib/calendar-helpers";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type CalendarGridEvent = {
  id: string;
  title: string;
  event_date: string;
  start_time: string | null;
  category: EventCategory;
};

type CalendarGridProps = {
  currentMonth: Date;
  calendarDays: CalendarDay[];
  selectedDate: Date;
  today: Date;
  events: CalendarGridEvent[];
  loadingEvents: boolean;
  onSelectDate: (date: Date) => void;
};

export default function CalendarGrid({
  currentMonth,
  calendarDays,
  selectedDate,
  today,
  events,
  loadingEvents,
  onSelectDate,
}: CalendarGridProps) {
  return (
    <>
      {/* Mobile gets its own compact grid: day number + up to 3 category
          dots, no per-event text preview, so all 7 columns fit the screen
          width instead of forcing horizontal scroll on a 720px-wide desktop
          grid. Tablet/desktop (sm+) keeps the original rich cell with
          event text previews, unchanged. */}
      <div className="grid grid-cols-7 border-b border-card-border bg-card">
        {weekDays.map((day) => (
          <div
            key={day}
            className="px-1 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground/30 sm:px-3 sm:py-3 sm:text-[11px] sm:tracking-[0.14em]"
          >
            <span className="sm:hidden">{day.slice(0, 1)}</span>
            <span className="hidden sm:inline">{day}</span>
          </div>
        ))}
      </div>

      <motion.div
        key={`${currentMonth.getFullYear()}-${currentMonth.getMonth()}`}
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: 0.28,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="grid grid-cols-7"
      >
        {calendarDays.map(({ date, isCurrentMonth }) => {
          const selected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, today);
          const dateKey = getLocalDateKey(date);

          const allDayEvents = events.filter(
            (calendarEvent) => calendarEvent.event_date === dateKey
          );

          const dayEvents = allDayEvents.slice(0, 2);
          const hiddenEventsCount = allDayEvents.length - dayEvents.length;
          const dotEvents = allDayEvents.slice(0, 3);

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => onSelectDate(date)}
              className={`group relative min-h-[64px] border-b border-r border-card-border p-1.5 text-left transition hover:bg-accent-violet/10 active:bg-accent-violet/15 sm:min-h-[128px] sm:p-3 ${
                selected ? "bg-accent-violet/10" : ""
              }`}
            >
              {selected && (
                <motion.div
                  layoutId="selected-calendar-day"
                  className="absolute inset-1 rounded-2xl border border-accent-violet/25 bg-accent-violet/10"
                  transition={{
                    duration: 0.22,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                />
              )}

              <div className="relative z-10">
                <div className="flex items-center justify-center sm:justify-between">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-semibold transition sm:h-8 sm:w-8 sm:rounded-xl sm:text-sm ${
                      isToday
                        ? "bg-accent-violet text-white"
                        : selected
                          ? "bg-accent-violet/70 text-white"
                          : isCurrentMonth
                            ? "text-foreground/70 group-hover:bg-surface-strong"
                            : "text-foreground/20"
                    }`}
                  >
                    {date.getDate()}
                  </span>

                  {isToday && (
                    <span className="hidden text-[10px] font-semibold uppercase tracking-[0.12em] text-violet-300 sm:inline">
                      Today
                    </span>
                  )}
                </div>

                {dotEvents.length > 0 && (
                  <div className="mt-1.5 flex justify-center gap-1 sm:hidden">
                    {dotEvents.map((calendarEvent) => (
                      <span
                        key={calendarEvent.id}
                        className={`h-1.5 w-1.5 rounded-full ${getCategoryDot(
                          calendarEvent.category
                        )}`}
                      />
                    ))}
                  </div>
                )}

                <div className="mt-3 hidden space-y-1.5 sm:block">
                  {dayEvents.map((calendarEvent) => (
                    <div
                      key={calendarEvent.id}
                      className="flex min-w-0 items-center gap-2 rounded-lg bg-surface-strong px-2 py-1.5 text-[10px] font-medium text-foreground/60"
                    >
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${getCategoryDot(
                          calendarEvent.category
                        )}`}
                      />

                      <span className="truncate">
                        {calendarEvent.start_time
                          ? `${formatTime(calendarEvent.start_time)} `
                          : ""}
                        {calendarEvent.title}
                      </span>
                    </div>
                  ))}

                  {hiddenEventsCount > 0 && (
                    <p className="px-2 text-[10px] font-semibold text-accent-violet">
                      +{hiddenEventsCount} more
                    </p>
                  )}
                </div>

                {loadingEvents && (
                  <div className="mt-2 hidden h-2 w-12 animate-pulse rounded-full bg-surface-strong sm:block" />
                )}
              </div>
            </button>
          );
        })}
      </motion.div>
    </>
  );
}
