import { createClient } from "../../../lib/supabase-server";

import { normalizeTitle } from "./task-matcher";
import { parseCreateEventArguments } from "./event-parsers";

import type { EventRecord } from "./types";

type SupabaseClient = Awaited<
  ReturnType<typeof createClient>
>;

type ExecuteEventActionArguments = {
  functionName: string;
  rawArguments: string;
  supabase: SupabaseClient;
  userId: string;
  events: EventRecord[];
};

type EventActionResult = {
  handled: boolean;
  reply: string;
  action: string | null;
};

const eventSelect =
  "id, title, description, event_date, start_time, end_time, category, created_at";

function formatEventTime(time: string | null) {
  if (!time) {
    return "";
  }

  const [hours, minutes] = time.split(":");

  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2000, 0, 1, Number(hours), Number(minutes))));
}

function formatCreatedEventReply(event: EventRecord) {
  const timeText = event.start_time
    ? event.end_time
      ? ` from ${formatEventTime(event.start_time)} to ${formatEventTime(event.end_time)}`
      : ` at ${formatEventTime(event.start_time)}`
    : "";

  return `✅ Event created: "${event.title}" on ${event.event_date}${timeText}. Category: ${event.category}.`;
}

export async function executeEventAction({
  functionName,
  rawArguments,
  supabase,
  userId,
  events,
}: ExecuteEventActionArguments): Promise<EventActionResult> {
  if (functionName !== "create_event") {
    return {
      handled: false,
      reply: "",
      action: null,
    };
  }

  const eventArguments = parseCreateEventArguments(rawArguments);

  const duplicateEvent = events.find(
    (event) =>
      event.event_date === eventArguments.event_date &&
      normalizeTitle(event.title) ===
        normalizeTitle(eventArguments.title)
  );

  if (duplicateEvent) {
    return {
      handled: true,
      action: "create_event",
      reply: `That event already exists on your calendar: "${duplicateEvent.title}" on ${duplicateEvent.event_date}.`,
    };
  }

  const { data: createdEvent, error: createEventError } =
    await supabase
      .from("calendar_events")
      .insert({
        user_id: userId,
        title: eventArguments.title,
        description: eventArguments.description,
        event_date: eventArguments.event_date,
        start_time: eventArguments.start_time,
        end_time: eventArguments.end_time,
        category: eventArguments.category,
        updated_at: new Date().toISOString(),
      })
      .select(eventSelect)
      .single();

  if (createEventError || !createdEvent) {
    console.error(
      "Could not create AI calendar event:",
      createEventError
    );

    throw new Error(
      "Orenios understood the request but could not create the calendar event."
    );
  }

  return {
    handled: true,
    action: "create_event",
    reply: formatCreatedEventReply(
      createdEvent as EventRecord
    ),
  };
}
