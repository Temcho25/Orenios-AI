import { isValidDateKey } from "../dates";

import type { EventCategory, TaskPriority } from "../types";
import type { ParsedPlanItem, PlanItemType } from "./types";

const validCategories: EventCategory[] = [
  "Personal",
  "Work",
  "Health",
  "Fitness",
  "Other",
];

const validPriorities: TaskPriority[] = ["low", "medium", "high"];

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

function isValidTime(value: unknown): value is string {
  return typeof value === "string" && timePattern.test(value);
}

// Unlike task/goal/event-parsers.ts (which throw and fail the whole
// single action when one field is invalid), this validates each item
// independently and drops only the items that don't hold up — a
// structured-output response can contain many items, and one malformed
// one (e.g. the model emitting a non-calendar date) shouldn't discard
// an otherwise-good voice plan. Rules mirror event-parsers.ts (same
// title cap, same HH:MM shape) but reimplemented for a skip-not-throw
// control flow, since wrapping every field in try/catch just to turn
// the throw into a skip would be less clear than writing it directly.
export function sanitizeParsedPlanItems(rawItems: unknown): {
  items: ParsedPlanItem[];
  droppedCount: number;
} {
  if (!Array.isArray(rawItems)) {
    return { items: [], droppedCount: 0 };
  }

  const items: ParsedPlanItem[] = [];
  let droppedCount = 0;

  for (const rawItem of rawItems) {
    const sanitized = sanitizeOneItem(rawItem);

    if (sanitized) {
      items.push(sanitized);
    } else {
      droppedCount += 1;
      console.warn(
        "Voice plan: dropped an unusable parsed item:",
        JSON.stringify(rawItem)
      );
    }
  }

  return { items, droppedCount };
}

function sanitizeOneItem(rawItem: unknown): ParsedPlanItem | null {
  if (typeof rawItem !== "object" || rawItem === null) {
    return null;
  }

  const item = rawItem as Record<string, unknown>;

  const type: PlanItemType | null =
    item.type === "event" || item.type === "task" ? item.type : null;

  if (!type) {
    return null;
  }

  const title =
    typeof item.title === "string" ? item.title.trim() : "";

  if (!title || title.length > 120) {
    return null;
  }

  const date = typeof item.date === "string" ? item.date.trim() : "";

  if (!date || !isValidDateKey(date)) {
    return null;
  }

  const category = validCategories.includes(item.category as EventCategory)
    ? (item.category as EventCategory)
    : "Other";

  const priority = validPriorities.includes(item.priority as TaskPriority)
    ? (item.priority as TaskPriority)
    : "medium";

  // Tasks never carry a time, regardless of what the model returned —
  // guarantees shape integrity per type rather than trusting the model
  // to have honored "always null when type is task".
  if (type === "task") {
    return {
      type,
      title,
      date,
      start_time: null,
      end_time: null,
      time_is_approximate: false,
      category,
      priority,
    };
  }

  const startTime = isValidTime(item.start_time) ? item.start_time : null;

  // An "event" with no resolvable start time isn't really time-bound —
  // fall back to treating it as a task rather than dropping the
  // content outright.
  if (!startTime) {
    return {
      type: "task",
      title,
      date,
      start_time: null,
      end_time: null,
      time_is_approximate: false,
      category,
      priority,
    };
  }

  const rawEndTime = isValidTime(item.end_time) ? item.end_time : null;
  const endTime =
    rawEndTime && rawEndTime > startTime ? rawEndTime : null;

  const timeIsApproximate = item.time_is_approximate === true;

  return {
    type: "event",
    title,
    date,
    start_time: startTime,
    end_time: endTime,
    time_is_approximate: timeIsApproximate,
    category,
    priority,
  };
}
