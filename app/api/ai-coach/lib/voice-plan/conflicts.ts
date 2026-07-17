import { DEFAULT_CONFLICT_CHECK_DURATION_MINUTES } from "./constants";

import type { EventRecord } from "../types";
import type { ParsedPlanItem, PlanItemConflict, PlanItemWithConflicts } from "./types";

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

// The effective end used for overlap math only — never written back to
// the database. A missing end_time falls back to start_time plus the
// assumed default duration (see constants.ts for why).
function getEffectiveEndMinutes(
  startMinutes: number,
  endTime: string | null
): number {
  if (endTime) {
    const endMinutes = timeToMinutes(endTime);

    // A stored/parsed end_time is only ever meaningful if it's after
    // the start; if it somehow isn't (shouldn't happen after
    // sanitization, but existing DB rows aren't sanitized by this
    // module), fall back to the assumed duration instead of producing
    // a nonsensical zero/negative-length interval.
    if (endMinutes > startMinutes) {
      return endMinutes;
    }
  }

  return startMinutes + DEFAULT_CONFLICT_CHECK_DURATION_MINUTES;
}

// Half-open interval overlap: [aStart, aEnd) intersects [bStart, bEnd).
export function doTimeRangesOverlap(
  aStart: string,
  aEnd: string | null,
  bStart: string,
  bEnd: string | null
): boolean {
  const aStartMinutes = timeToMinutes(aStart);
  const bStartMinutes = timeToMinutes(bStart);

  const aEndMinutes = getEffectiveEndMinutes(aStartMinutes, aEnd);
  const bEndMinutes = getEffectiveEndMinutes(bStartMinutes, bEnd);

  return aStartMinutes < bEndMinutes && bStartMinutes < aEndMinutes;
}

type MinimalExistingEvent = Pick<
  EventRecord,
  "title" | "event_date" | "start_time" | "end_time"
>;

// Two-pass conflict detection: each parsed event is checked against
// (1) the user's real existing calendar_events on the same date, and
// (2) every other event in the same parsed batch on the same date.
// Tasks are skipped entirely — they carry no time, so they cannot
// time-conflict with anything.
export function detectConflicts(
  items: ParsedPlanItem[],
  existingEvents: MinimalExistingEvent[]
): PlanItemWithConflicts[] {
  return items.map((item, index) => {
    if (item.type !== "event" || !item.start_time) {
      return { ...item, conflicts: [] };
    }

    const conflicts: PlanItemConflict[] = [];

    for (const existingEvent of existingEvents) {
      if (
        existingEvent.event_date === item.date &&
        existingEvent.start_time &&
        doTimeRangesOverlap(
          item.start_time,
          item.end_time,
          existingEvent.start_time,
          existingEvent.end_time
        )
      ) {
        conflicts.push({
          kind: "existing_event",
          title: existingEvent.title,
          date: existingEvent.event_date,
          start_time: existingEvent.start_time,
          end_time: existingEvent.end_time,
        });
      }
    }

    for (const [otherIndex, otherItem] of items.entries()) {
      if (
        otherIndex === index ||
        otherItem.type !== "event" ||
        !otherItem.start_time ||
        otherItem.date !== item.date
      ) {
        continue;
      }

      if (
        doTimeRangesOverlap(
          item.start_time,
          item.end_time,
          otherItem.start_time,
          otherItem.end_time
        )
      ) {
        conflicts.push({
          kind: "new_item",
          title: otherItem.title,
          date: otherItem.date,
          start_time: otherItem.start_time,
          end_time: otherItem.end_time,
        });
      }
    }

    return { ...item, conflicts };
  });
}
