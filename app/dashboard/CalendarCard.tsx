"use client";

import { motion } from "framer-motion";
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createClient } from "../lib/supabase";
import { getLocalDateKey } from "../lib/date-utils";
import type { EventCategory } from "../lib/event-category";
import { getCalendarDays } from "./lib/calendar-helpers";
import CalendarGrid from "./CalendarGrid";
import CalendarEventForm from "./CalendarEventForm";
import CalendarDayEventList from "./CalendarDayEventList";

export type CalendarEvent = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  category: EventCategory;
  created_at: string;
};

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
    <section className="overflow-hidden rounded-3xl border border-card-border bg-card backdrop-blur-[12px]">
      <div className="border-b border-card-border px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Calendar
            </p>

            <p className="mt-1 text-xs text-foreground/40">
              Organize your time and see what&apos;s coming next
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goToToday}
              className="flex h-11 items-center rounded-xl border border-muted-border bg-muted px-4 text-xs font-semibold text-foreground/60 transition hover:border-border-strong hover:text-foreground"
            >
              Today
            </button>

            <button
              type="button"
              onClick={goToPreviousMonth}
              aria-label="Previous month"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-muted-border bg-muted text-foreground/50 transition hover:border-border-strong hover:text-foreground"
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
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-muted-border bg-muted text-foreground/50 transition hover:border-border-strong hover:text-foreground"
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
            className="text-2xl font-semibold tracking-[-0.04em] text-foreground sm:text-3xl"
          >
            {monthTitle}
          </motion.h2>

          <p className="text-sm text-foreground/40">
            Selected:{" "}
            <span className="font-semibold text-foreground/70">
              {selectedDateTitle}
            </span>
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="border-b border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300 sm:px-6">
          {errorMessage}
        </div>
      )}

      <CalendarGrid
        currentMonth={currentMonth}
        calendarDays={calendarDays}
        selectedDate={selectedDate}
        today={today}
        events={events}
        loadingEvents={loadingEvents}
        onSelectDate={selectDate}
      />

      <div className="border-t border-card-border bg-card px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground/80">
              {selectedDateTitle}
            </p>

            <p className="mt-1 text-xs text-foreground/40">
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

        <CalendarEventForm
          formOpen={formOpen}
          title={title}
          description={description}
          eventDate={eventDate}
          startTime={startTime}
          endTime={endTime}
          category={category}
          savingEvent={savingEvent}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          onEventDateChange={setEventDate}
          onStartTimeChange={setStartTime}
          onEndTimeChange={setEndTime}
          onCategoryChange={setCategory}
          onSubmit={handleCreateEvent}
          onClose={closeEventForm}
        />

        <CalendarDayEventList
          loadingEvents={loadingEvents}
          selectedDateEvents={selectedDateEvents}
          pendingEventIds={pendingEventIds}
          onDelete={deleteEvent}
        />
      </div>
    </section>
  );
}
