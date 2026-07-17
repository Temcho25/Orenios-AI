import { normalizeTitle } from "./task-matcher";

import type { EventRecord } from "./types";

export { normalizeTitle as normalizeEventTitle };

// Events are matched by title like tasks and goals, but a title alone
// can collide across dates (a recurring "Team standup"), so a caller
// may also pass a reference date to narrow the candidate set first.
export function findBestEventMatch(
  events: EventRecord[],
  requestedTitle: string,
  referenceDate: string | null
) {
  const candidates = referenceDate
    ? events.filter((event) => event.event_date === referenceDate)
    : events;

  const normalizedRequestedTitle = normalizeTitle(requestedTitle);

  const exactMatches = candidates.filter(
    (event) =>
      normalizeTitle(event.title) === normalizedRequestedTitle
  );

  if (exactMatches.length === 1) {
    return {
      status: "found" as const,
      event: exactMatches[0],
    };
  }

  if (exactMatches.length > 1) {
    return {
      status: "ambiguous" as const,
      events: exactMatches,
    };
  }

  const partialMatches = candidates.filter((event) => {
    const normalizedEventTitle = normalizeTitle(event.title);

    return (
      normalizedEventTitle.includes(normalizedRequestedTitle) ||
      normalizedRequestedTitle.includes(normalizedEventTitle)
    );
  });

  if (partialMatches.length === 1) {
    return {
      status: "found" as const,
      event: partialMatches[0],
    };
  }

  if (partialMatches.length > 1) {
    return {
      status: "ambiguous" as const,
      events: partialMatches,
    };
  }

  return {
    status: "not_found" as const,
  };
}

export function formatAmbiguousEventReply(
  events: EventRecord[],
  actionText: string
) {
  const matchingEvents = events
    .slice(0, 5)
    .map(
      (event) => `"${event.title}" on ${event.event_date}`
    )
    .join(", ");

  return `I found multiple matching events: ${matchingEvents}. Please tell me which one you want to ${actionText}.`;
}
