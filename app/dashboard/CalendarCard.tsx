"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createClient } from "../lib/supabase";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const categories = [
  "Personal",
  "Work",
  "Health",
  "Fitness",
  "Other",
] as const;

type EventCategory = (typeof categories)[number];

type CalendarEvent = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  category: EventCategory;
  created_at: string;
};

type CalendarDay = {
  date: Date;
  isCurrentMonth: boolean;
};

function getLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isSameDay(firstDate: Date, secondDate: Date) {
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  );
}

function getCalendarDays(currentMonth: Date): CalendarDay[] {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const mondayBasedStartDay = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = lastDayOfMonth.getDate();
  const previousMonthLastDay = new Date(year, month, 0).getDate();

  const calendarDays: CalendarDay[] = [];

  for (
    let index = mondayBasedStartDay - 1;
    index >= 0;
    index -= 1
  ) {
    calendarDays.push({
      date: new Date(
        year,
        month - 1,
        previousMonthLastDay - index
      ),
      isCurrentMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    calendarDays.push({
      date: new Date(year, month, day),
      isCurrentMonth: true,
    });
  }

  let nextMonthDay = 1;

  while (calendarDays.length < 42) {
    calendarDays.push({
      date: new Date(year, month + 1, nextMonthDay),
      isCurrentMonth: false,
    });

    nextMonthDay += 1;
  }

  return calendarDays;
}

function formatTime(time: string | null) {
  if (!time) {
    return "All day";
  }

  return time.slice(0, 5);
}

function getCategoryClasses(category: EventCategory) {
  switch (category) {
    case "Work":
      return "bg-blue-500/10 text-blue-300 border-blue-500/20";
    case "Health":
      return "bg-emerald-500/10 text-emerald-300 border-emerald-500/20";
    case "Fitness":
      return "bg-orange-500/10 text-orange-300 border-orange-500/20";
    case "Other":
      return "bg-white/[0.08] text-white/50 border-white/10";
    default:
      return "bg-accent-violet/10 text-accent-violet border-accent-violet/20";
  }
}

function getCategoryDot(category: EventCategory) {
  switch (category) {
    case "Work":
      return "bg-blue-500";
    case "Health":
      return "bg-emerald-500";
    case "Fitness":
      return "bg-orange-500";
    case "Other":
      return "bg-gray-300";
    default:
      return "bg-violet-500";
  }
}

export default function CalendarCard() {
  const today = useMemo(() => new Date(), []);

  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const [selectedDate, setSelectedDate] = useState(today);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState(
    getLocalDateKey(today)
  );
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [category, setCategory] =
    useState<EventCategory>("Personal");

  const [loadingEvents, setLoadingEvents] = useState(true);
  const [savingEvent, setSavingEvent] = useState(false);
  const [pendingEventIds, setPendingEventIds] = useState<
    string[]
  >([]);
  const [errorMessage, setErrorMessage] = useState("");

  const calendarDays = useMemo(
    () => getCalendarDays(currentMonth),
    [currentMonth]
  );

  const visibleStartDate = getLocalDateKey(
    calendarDays[0].date
  );

  const visibleEndDate = getLocalDateKey(
    calendarDays[calendarDays.length - 1].date
  );

  const monthTitle = new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
  }).format(currentMonth);

  const selectedDateTitle = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(selectedDate);

  const selectedDateKey = getLocalDateKey(selectedDate);

  const selectedDateEvents = useMemo(
    () =>
      events
        .filter(
          (calendarEvent) =>
            calendarEvent.event_date === selectedDateKey
        )
        .sort((firstEvent, secondEvent) => {
          if (!firstEvent.start_time && secondEvent.start_time) {
            return -1;
          }

          if (firstEvent.start_time && !secondEvent.start_time) {
            return 1;
          }

          return (firstEvent.start_time ?? "").localeCompare(
            secondEvent.start_time ?? ""
          );
        }),
    [events, selectedDateKey]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      setLoadingEvents(true);
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
          .from("calendar_events")
          .select(
            "id, title, description, event_date, start_time, end_time, category, created_at"
          )
          .eq("user_id", user.id)
          .gte("event_date", visibleStartDate)
          .lte("event_date", visibleEndDate)
          .order("event_date", { ascending: true })
          .order("start_time", { ascending: true });

        if (error) {
          throw error;
        }

        if (!cancelled) {
          setEvents((data ?? []) as CalendarEvent[]);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Could not load your calendar."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingEvents(false);
        }
      }
    }

    loadEvents();

    return () => {
      cancelled = true;
    };
  }, [visibleStartDate, visibleEndDate]);

  function goToPreviousMonth() {
    setCurrentMonth(
      (currentDate) =>
        new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 1,
          1
        )
    );
  }

  function goToNextMonth() {
    setCurrentMonth(
      (currentDate) =>
        new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          1
        )
    );
  }

  function goToToday() {
    const nextToday = new Date();

    setCurrentMonth(
      new Date(
        nextToday.getFullYear(),
        nextToday.getMonth(),
        1
      )
    );

    setSelectedDate(nextToday);
    setEventDate(getLocalDateKey(nextToday));
  }

  function selectDate(date: Date) {
    setSelectedDate(date);
    setEventDate(getLocalDateKey(date));

    if (
      date.getMonth() !== currentMonth.getMonth() ||
      date.getFullYear() !== currentMonth.getFullYear()
    ) {
      setCurrentMonth(
        new Date(date.getFullYear(), date.getMonth(), 1)
      );
    }
  }

  function openEventForm() {
    setEventDate(selectedDateKey);
    setFormOpen(true);
    setErrorMessage("");
  }

  function closeEventForm() {
    setFormOpen(false);
    setTitle("");
    setDescription("");
    setStartTime("");
    setEndTime("");
    setCategory("Personal");
    setEventDate(selectedDateKey);
    setErrorMessage("");
  }

  function setEventPending(eventId: string, pending: boolean) {
    setPendingEventIds((currentIds) =>
      pending
        ? [...currentIds, eventId]
        : currentIds.filter((id) => id !== eventId)
    );
  }

  async function handleCreateEvent(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const normalizedTitle = title.trim();
    const normalizedDescription = description.trim();

    setErrorMessage("");

    if (!normalizedTitle) {
      setErrorMessage("Please enter an event title.");
      return;
    }

    if (!eventDate) {
      setErrorMessage("Please choose an event date.");
      return;
    }

    if (endTime && !startTime) {
      setErrorMessage(
        "Please choose a start time before adding an end time."
      );
      return;
    }

    if (startTime && endTime && endTime <= startTime) {
      setErrorMessage(
        "The end time must be later than the start time."
      );
      return;
    }

    setSavingEvent(true);

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
        .from("calendar_events")
        .insert({
          user_id: user.id,
          title: normalizedTitle,
          description: normalizedDescription || null,
          event_date: eventDate,
          start_time: startTime || null,
          end_time: endTime || null,
          category,
          updated_at: new Date().toISOString(),
        })
        .select(
          "id, title, description, event_date, start_time, end_time, category, created_at"
        )
        .single();

      if (error) {
        throw error;
      }

      const createdEvent = data as CalendarEvent;

      setEvents((currentEvents) => {
        const withoutDuplicate = currentEvents.filter(
          (calendarEvent) =>
            calendarEvent.id !== createdEvent.id
        );

        return [...withoutDuplicate, createdEvent];
      });

      const createdDate = new Date(
        `${createdEvent.event_date}T00:00:00`
      );

      setSelectedDate(createdDate);
      setCurrentMonth(
        new Date(
          createdDate.getFullYear(),
          createdDate.getMonth(),
          1
        )
      );

      closeEventForm();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not create the event."
      );
    } finally {
      setSavingEvent(false);
    }
  }

  async function deleteEvent(calendarEvent: CalendarEvent) {
    if (pendingEventIds.includes(calendarEvent.id)) {
      return;
    }

    setErrorMessage("");
    setEventPending(calendarEvent.id, true);

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
        .from("calendar_events")
        .delete()
        .eq("id", calendarEvent.id)
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      setEvents((currentEvents) =>
        currentEvents.filter(
          (eventItem) => eventItem.id !== calendarEvent.id
        )
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not delete the event."
      );
    } finally {
      setEventPending(calendarEvent.id, false);
    }
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-[12px]">
      <div className="border-b border-white/[0.06] px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-white">
              Calendar
            </p>

            <p className="mt-1 text-xs text-white/40">
              Organize your time and see what&apos;s coming next
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goToToday}
              className="flex h-11 items-center rounded-xl border border-white/10 bg-white/[0.05] px-4 text-xs font-semibold text-white/60 transition hover:border-white/15 hover:text-white"
            >
              Today
            </button>

            <button
              type="button"
              onClick={goToPreviousMonth}
              aria-label="Previous month"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white/50 transition hover:border-white/15 hover:text-white"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="m15 18-6-6 6-6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <button
              type="button"
              onClick={goToNextMonth}
              aria-label="Next month"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white/50 transition hover:border-white/15 hover:text-white"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="m9 18 6-6-6-6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <motion.h2
            key={monthTitle}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl"
          >
            {monthTitle}
          </motion.h2>

          <p className="text-sm text-white/40">
            Selected:{" "}
            <span className="font-semibold text-white/70">
              {selectedDateTitle}
            </span>
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="border-b border-red-500/20 bg-red-500/10 px-5 py-3 text-sm text-red-300 sm:px-6">
          {errorMessage}
        </div>
      )}

      {/* Mobile gets its own compact grid: day number + up to 3 category
          dots, no per-event text preview, so all 7 columns fit the screen
          width instead of forcing horizontal scroll on a 720px-wide desktop
          grid. Tablet/desktop (sm+) keeps the original rich cell with
          event text previews, unchanged. */}
      <div className="grid grid-cols-7 border-b border-white/[0.06] bg-white/[0.02]">
        {weekDays.map((day) => (
          <div
            key={day}
            className="px-1 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.1em] text-white/30 sm:px-3 sm:py-3 sm:text-[11px] sm:tracking-[0.14em]"
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
              onClick={() => selectDate(date)}
              className={`group relative min-h-[64px] border-b border-r border-white/[0.06] p-1.5 text-left transition hover:bg-accent-violet/10 active:bg-accent-violet/15 sm:min-h-[128px] sm:p-3 ${
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
                            ? "text-white/70 group-hover:bg-white/[0.08]"
                            : "text-white/20"
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
                      className="flex min-w-0 items-center gap-2 rounded-lg bg-white/[0.06] px-2 py-1.5 text-[10px] font-medium text-white/60"
                    >
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${getCategoryDot(
                          calendarEvent.category
                        )}`}
                      />

                      <span className="truncate">
                        {calendarEvent.start_time
                          ? `${formatTime(
                              calendarEvent.start_time
                            )} `
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
                  <div className="mt-2 hidden h-2 w-12 animate-pulse rounded-full bg-white/[0.08] sm:block" />
                )}
              </div>
            </button>
          );
        })}
      </motion.div>

      <div className="border-t border-white/[0.06] bg-white/[0.02] px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-white/80">
              {selectedDateTitle}
            </p>

            <p className="mt-1 text-xs text-white/40">
              {selectedDateEvents.length === 0
                ? "No events scheduled for this day"
                : `${selectedDateEvents.length} ${
                    selectedDateEvents.length === 1
                      ? "event"
                      : "events"
                  } scheduled`}
            </p>
          </div>

          <button
            type="button"
            onClick={openEventForm}
            className="cta-gradient flex h-11 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(124,111,240,0.3)] transition"
          >
            Add event
            <span aria-hidden="true">+</span>
          </button>
        </div>

        <AnimatePresence>
          {formOpen && (
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleCreateEvent}
              className="mt-5 rounded-3xl border border-accent-violet/15 bg-accent-violet/[0.04] p-5"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">
                    New event
                  </p>

                  <p className="mt-1 text-xs text-white/40">
                    Add something important to your schedule
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeEventForm}
                  disabled={savingEvent}
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.06] text-white/40 transition hover:text-white"
                  aria-label="Close event form"
                >
                  ×
                </button>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div>
                  <label
                    htmlFor="event-title"
                    className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-violet-300"
                  >
                    Event title
                  </label>

                  <input
                    id="event-title"
                    type="text"
                    value={title}
                    onChange={(event) =>
                      setTitle(event.target.value)
                    }
                    placeholder="Boxing training"
                    maxLength={140}
                    disabled={savingEvent}
                    className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-accent-violet/40 focus:ring-4 focus:ring-accent-violet/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="event-date"
                    className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-violet-300"
                  >
                    Date
                  </label>

                  <input
                    id="event-date"
                    type="date"
                    value={eventDate}
                    onChange={(event) =>
                      setEventDate(event.target.value)
                    }
                    disabled={savingEvent}
                    className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-sm text-white outline-none transition [color-scheme:dark] focus:border-accent-violet/40 focus:ring-4 focus:ring-accent-violet/10"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label
                  htmlFor="event-description"
                  className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-violet-300"
                >
                  Description
                </label>

                <textarea
                  id="event-description"
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Add optional details..."
                  maxLength={500}
                  rows={3}
                  disabled={savingEvent}
                  className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/30 focus:border-accent-violet/40 focus:ring-4 focus:ring-accent-violet/10"
                />
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <label
                    htmlFor="event-start-time"
                    className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-violet-300"
                  >
                    Start time
                  </label>

                  <input
                    id="event-start-time"
                    type="time"
                    value={startTime}
                    onChange={(event) =>
                      setStartTime(event.target.value)
                    }
                    disabled={savingEvent}
                    className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-sm text-white outline-none transition [color-scheme:dark] focus:border-accent-violet/40 focus:ring-4 focus:ring-accent-violet/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="event-end-time"
                    className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-violet-300"
                  >
                    End time
                  </label>

                  <input
                    id="event-end-time"
                    type="time"
                    value={endTime}
                    onChange={(event) =>
                      setEndTime(event.target.value)
                    }
                    disabled={savingEvent}
                    className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-sm text-white outline-none transition [color-scheme:dark] focus:border-accent-violet/40 focus:ring-4 focus:ring-accent-violet/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="event-category"
                    className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-violet-300"
                  >
                    Category
                  </label>

                  <select
                    id="event-category"
                    value={category}
                    onChange={(event) =>
                      setCategory(
                        event.target.value as EventCategory
                      )
                    }
                    disabled={savingEvent}
                    className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-sm text-white outline-none transition focus:border-accent-violet/40 focus:ring-4 focus:ring-accent-violet/10"
                  >
                    {categories.map((categoryOption) => (
                      <option
                        key={categoryOption}
                        value={categoryOption}
                        className="bg-surface-workspace text-white"
                      >
                        {categoryOption}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <motion.button
                  whileHover={
                    savingEvent ? undefined : { scale: 1.01 }
                  }
                  whileTap={
                    savingEvent ? undefined : { scale: 0.99 }
                  }
                  type="submit"
                  disabled={savingEvent || !title.trim()}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingEvent ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Saving event...
                    </>
                  ) : (
                    <>
                      Save event
                      <span aria-hidden="true">→</span>
                    </>
                  )}
                </motion.button>

                <button
                  type="button"
                  onClick={closeEventForm}
                  disabled={savingEvent}
                  className="h-12 rounded-2xl border border-white/10 bg-white/[0.05] px-5 text-sm font-semibold text-white/60 transition hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="mt-5 space-y-3">
          {loadingEvents ? (
            [1, 2].map((item) => (
              <div
                key={item}
                className="flex animate-pulse items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-4"
              >
                <div className="h-10 w-10 rounded-xl bg-white/[0.08]" />
                <div className="flex-1">
                  <div className="h-4 w-40 rounded-full bg-white/[0.08]" />
                  <div className="mt-2 h-3 w-24 rounded-full bg-white/[0.05]" />
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
                    className="flex items-start gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-4 backdrop-blur-[12px] transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-violet/25 hover:bg-white/[0.05] hover:shadow-[0_20px_45px_-15px_rgba(124,111,240,0.35)]"
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
                        <h3 className="text-sm font-semibold text-white">
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

                      <p className="mt-1 text-xs text-white/40">
                        {calendarEvent.start_time
                          ? `${formatTime(
                              calendarEvent.start_time
                            )}${
                              calendarEvent.end_time
                                ? ` – ${formatTime(
                                    calendarEvent.end_time
                                  )}`
                                : ""
                            }`
                          : "All-day event"}
                      </p>

                      {calendarEvent.description && (
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/50">
                          {calendarEvent.description}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        deleteEvent(calendarEvent)
                      }
                      disabled={eventPending}
                      aria-label={`Delete "${calendarEvent.title}"`}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white/25 transition hover:bg-red-500/10 hover:text-red-400 disabled:cursor-wait"
                    >
                      {eventPending ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
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
            <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-9 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-violet/15 text-accent-violet">
                <span className="text-xl">+</span>
              </div>

              <p className="mt-4 text-sm font-semibold text-white/80">
                Your schedule is clear.
              </p>

              <p className="mt-2 text-sm text-white/40">
                Add an event when something important comes up.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
