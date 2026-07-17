import { createClient } from "../../../lib/supabase-server";

import { normalizeTitle } from "./task-matcher";
import {
  findBestEventMatch,
  formatAmbiguousEventReply,
} from "./event-matcher";
import {
  parseCreateEventArguments,
  parseDeleteEventArguments,
  parseUpdateEventArguments,
} from "./event-parsers";

import type { EventCategory, EventRecord } from "./types";

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
  if (functionName === "create_event") {
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

  if (functionName === "delete_event") {
    const deleteArguments = parseDeleteEventArguments(rawArguments);

    const match = findBestEventMatch(
      events,
      deleteArguments.title,
      deleteArguments.event_date
    );

    if (match.status === "not_found") {
      return {
        handled: true,
        action: "delete_event",
        reply: `I couldn’t find an event matching "${deleteArguments.title}" on your calendar.`,
      };
    }

    if (match.status === "ambiguous") {
      return {
        handled: true,
        action: "delete_event",
        reply: formatAmbiguousEventReply(match.events, "delete"),
      };
    }

    const { data: deletedEvent, error: deleteEventError } =
      await supabase
        .from("calendar_events")
        .delete()
        .eq("id", match.event.id)
        .eq("user_id", userId)
        .select(eventSelect)
        .single();

    if (deleteEventError || !deletedEvent) {
      console.error(
        "Could not delete AI calendar event:",
        deleteEventError
      );

      throw new Error(
        "Orenios found the event but could not delete it."
      );
    }

    return {
      handled: true,
      action: "delete_event",
      reply: `✅ Event deleted: "${deletedEvent.title}" on ${deletedEvent.event_date}.`,
    };
  }

  if (functionName === "update_event") {
    const updateArguments = parseUpdateEventArguments(rawArguments);

    const match = findBestEventMatch(
      events,
      updateArguments.title,
      updateArguments.event_date
    );

    if (match.status === "not_found") {
      return {
        handled: true,
        action: "update_event",
        reply: `I couldn’t find an event matching "${updateArguments.title}" on your calendar.`,
      };
    }

    if (match.status === "ambiguous") {
      return {
        handled: true,
        action: "update_event",
        reply: formatAmbiguousEventReply(match.events, "update"),
      };
    }

    const finalEventDate =
      updateArguments.new_event_date ?? match.event.event_date;

    if (updateArguments.new_title) {
      const duplicateTitle = events.find(
        (event) =>
          event.id !== match.event.id &&
          event.event_date === finalEventDate &&
          normalizeTitle(event.title) ===
            normalizeTitle(updateArguments.new_title!)
      );

      if (duplicateTitle) {
        return {
          handled: true,
          action: "update_event",
          reply: `An event already exists with the title "${duplicateTitle.title}" on ${duplicateTitle.event_date}.`,
        };
      }
    }

    const finalStartTime =
      updateArguments.start_time ?? match.event.start_time;

    const finalEndTime = updateArguments.remove_end_time
      ? null
      : (updateArguments.end_time ?? match.event.end_time);

    if (finalEndTime && !finalStartTime) {
      throw new Error(
        "An end time requires a start time for the event."
      );
    }

    if (
      finalStartTime &&
      finalEndTime &&
      finalEndTime <= finalStartTime
    ) {
      throw new Error(
        "The event end time must be later than the start time."
      );
    }

    const updates: {
      title?: string;
      event_date?: string;
      start_time?: string | null;
      end_time?: string | null;
      category?: EventCategory;
      updated_at: string;
    } = {
      updated_at: new Date().toISOString(),
    };

    if (updateArguments.new_title) {
      updates.title = updateArguments.new_title;
    }

    if (updateArguments.new_event_date) {
      updates.event_date = updateArguments.new_event_date;
    }

    if (
      updateArguments.start_time ||
      updateArguments.end_time ||
      updateArguments.remove_end_time
    ) {
      updates.start_time = finalStartTime;
      updates.end_time = finalEndTime;
    }

    if (updateArguments.category) {
      updates.category = updateArguments.category;
    }

    const { data: updatedEvent, error: updateEventError } =
      await supabase
        .from("calendar_events")
        .update(updates)
        .eq("id", match.event.id)
        .eq("user_id", userId)
        .select(eventSelect)
        .single();

    if (updateEventError || !updatedEvent) {
      console.error(
        "Could not update AI calendar event:",
        updateEventError
      );

      throw new Error(
        "Orenios found the event but could not update it."
      );
    }

    const changes: string[] = [];

    if (updateArguments.new_title) {
      changes.push(`renamed to "${updatedEvent.title}"`);
    }

    if (updateArguments.new_event_date) {
      changes.push(`moved to ${updatedEvent.event_date}`);
    }

    if (
      updateArguments.start_time ||
      updateArguments.end_time ||
      updateArguments.remove_end_time
    ) {
      changes.push(
        updatedEvent.start_time
          ? `time changed to ${formatEventTime(updatedEvent.start_time)}${
              updatedEvent.end_time
                ? ` - ${formatEventTime(updatedEvent.end_time)}`
                : ""
            }`
          : "time removed"
      );
    }

    if (updateArguments.category) {
      changes.push(`category changed to ${updatedEvent.category}`);
    }

    return {
      handled: true,
      action: "update_event",
      reply: `✅ Event updated: ${changes.join(", ")}.`,
    };
  }

  return {
    handled: false,
    reply: "",
    action: null,
  };
}
