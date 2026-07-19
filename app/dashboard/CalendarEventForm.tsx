"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { FormEvent } from "react";
import { EVENT_CATEGORIES, type EventCategory } from "../lib/event-category";

const categories = EVENT_CATEGORIES;

type CalendarEventFormProps = {
  formOpen: boolean;
  title: string;
  description: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  category: EventCategory;
  savingEvent: boolean;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onEventDateChange: (value: string) => void;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
  onCategoryChange: (value: EventCategory) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
};

export default function CalendarEventForm({
  formOpen,
  title,
  description,
  eventDate,
  startTime,
  endTime,
  category,
  savingEvent,
  onTitleChange,
  onDescriptionChange,
  onEventDateChange,
  onStartTimeChange,
  onEndTimeChange,
  onCategoryChange,
  onSubmit,
  onClose,
}: CalendarEventFormProps) {
  return (
    <AnimatePresence>
      {formOpen && (
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          onSubmit={onSubmit}
          className="mt-5 rounded-3xl border border-accent-violet/15 bg-accent-violet/[0.04] p-5"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-foreground">
                New event
              </p>

              <p className="mt-1 text-xs text-foreground/40">
                Add something important to your schedule
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={savingEvent}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-strong text-foreground/40 transition hover:text-foreground"
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
                onChange={(event) => onTitleChange(event.target.value)}
                placeholder="Boxing training"
                maxLength={140}
                disabled={savingEvent}
                className="h-12 w-full rounded-2xl border border-muted-border bg-muted px-4 text-sm text-foreground outline-none transition placeholder:text-foreground/30 focus:border-accent-violet/40 focus:ring-4 focus:ring-accent-violet/10"
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
                onChange={(event) => onEventDateChange(event.target.value)}
                disabled={savingEvent}
                className="h-12 w-full rounded-2xl border border-muted-border bg-muted px-4 text-sm text-foreground outline-none transition [color-scheme:dark] focus:border-accent-violet/40 focus:ring-4 focus:ring-accent-violet/10"
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
              onChange={(event) => onDescriptionChange(event.target.value)}
              placeholder="Add optional details..."
              maxLength={500}
              rows={3}
              disabled={savingEvent}
              className="w-full resize-none rounded-2xl border border-muted-border bg-muted px-4 py-3 text-sm leading-6 text-foreground outline-none transition placeholder:text-foreground/30 focus:border-accent-violet/40 focus:ring-4 focus:ring-accent-violet/10"
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
                onChange={(event) => onStartTimeChange(event.target.value)}
                disabled={savingEvent}
                className="h-12 w-full rounded-2xl border border-muted-border bg-muted px-4 text-sm text-foreground outline-none transition [color-scheme:dark] focus:border-accent-violet/40 focus:ring-4 focus:ring-accent-violet/10"
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
                onChange={(event) => onEndTimeChange(event.target.value)}
                disabled={savingEvent}
                className="h-12 w-full rounded-2xl border border-muted-border bg-muted px-4 text-sm text-foreground outline-none transition [color-scheme:dark] focus:border-accent-violet/40 focus:ring-4 focus:ring-accent-violet/10"
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
                  onCategoryChange(event.target.value as EventCategory)
                }
                disabled={savingEvent}
                className="h-12 w-full rounded-2xl border border-muted-border bg-muted px-4 text-sm text-foreground outline-none transition focus:border-accent-violet/40 focus:ring-4 focus:ring-accent-violet/10"
              >
                {categories.map((categoryOption) => (
                  <option
                    key={categoryOption}
                    value={categoryOption}
                    className="bg-background text-foreground"
                  >
                    {categoryOption}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <motion.button
              whileHover={savingEvent ? undefined : { scale: 1.01 }}
              whileTap={savingEvent ? undefined : { scale: 0.99 }}
              type="submit"
              disabled={savingEvent || !title.trim()}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-muted-border bg-surface-strong px-5 text-sm font-semibold text-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingEvent ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-border-strong border-t-foreground" />
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
              onClick={onClose}
              disabled={savingEvent}
              className="h-12 rounded-2xl border border-muted-border bg-muted px-5 text-sm font-semibold text-foreground/60 transition hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
