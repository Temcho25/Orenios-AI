import { isValidDateKey } from "./dates";

import type {
  CreateEventArguments,
  EventCategory,
} from "./types";

const validCategories: EventCategory[] = [
  "Personal",
  "Work",
  "Health",
  "Fitness",
  "Other",
];

function validateEventTitle(value: unknown) {
  const title = typeof value === "string" ? value.trim() : "";

  if (!title) {
    throw new Error("The event title is missing.");
  }

  if (title.length > 120) {
    throw new Error(
      "The event title cannot be longer than 120 characters."
    );
  }

  return title;
}

function parseOptionalDescription(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const description = value.trim();

  if (!description) {
    return null;
  }

  if (description.length > 300) {
    throw new Error(
      "The event description cannot be longer than 300 characters."
    );
  }

  return description;
}

function parseEventTime(value: unknown, label: string) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const normalized = value.trim();

  if (!/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/.test(normalized)) {
    throw new Error(
      `The event ${label} must use a valid 24-hour HH:MM time.`
    );
  }

  return normalized.length === 5
    ? `${normalized}:00`
    : normalized;
}

export function parseCreateEventArguments(
  rawArguments: string
): CreateEventArguments {
  const parsed = JSON.parse(
    rawArguments
  ) as Partial<CreateEventArguments>;

  const title = validateEventTitle(parsed.title);
  const description = parseOptionalDescription(
    parsed.description
  );

  const eventDate =
    typeof parsed.event_date === "string"
      ? parsed.event_date.trim()
      : "";

  if (!eventDate || !isValidDateKey(eventDate)) {
    throw new Error(
      "The event date must use a valid YYYY-MM-DD date."
    );
  }

  const startTime = parseEventTime(
    parsed.start_time,
    "start time"
  );

  const endTime = parseEventTime(
    parsed.end_time,
    "end time"
  );

  if (endTime && !startTime) {
    throw new Error(
      "An end time requires a start time for the event."
    );
  }

  if (startTime && endTime && endTime <= startTime) {
    throw new Error(
      "The event end time must be later than the start time."
    );
  }

  const category = validCategories.includes(
    parsed.category as EventCategory
  )
    ? (parsed.category as EventCategory)
    : "Other";

  return {
    title,
    description,
    event_date: eventDate,
    start_time: startTime,
    end_time: endTime,
    category,
  };
}
