import { createClient } from "../../../../lib/supabase-server";
import { normalizeTitle } from "../task-matcher";
import { insertTaskRow } from "../task-actions";
import { insertEventRow, formatCreatedEventReply } from "../event-actions";
import { formatCreatedTaskReply } from "../task-replies";
import { buildLinkedContextNote } from "./linking";
import type { ConfirmedItemResult, ParsedPlanItem } from "./types";
import type { EventRecord, GoalRecord, TaskRecord } from "../types";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export type ConfirmPlanItemsResult = {
  created: ConfirmedItemResult[];
  skippedCount: number;
  failedCount: number;
  failedTitles: string[];
};

// Each item is inserted independently: if one item's DB write fails
// partway through the batch, the rest of the plan should still go
// through rather than the whole confirm aborting and leaving the user
// unsure which of their events/tasks actually got saved. Duplicate
// checks run against a fresh read of the caller's tables, so retrying
// with the same (or the whole original) item list is safe — anything
// already saved is skipped, not recreated.
export async function confirmPlanItems({
  items,
  supabase,
  userId,
  existingTasks,
  existingGoals,
  existingEvents,
}: {
  items: ParsedPlanItem[];
  supabase: SupabaseClient;
  userId: string;
  existingTasks: TaskRecord[];
  existingGoals: GoalRecord[];
  existingEvents: EventRecord[];
}): Promise<ConfirmPlanItemsResult> {
  const created: ConfirmedItemResult[] = [];
  let skippedCount = 0;
  const failedTitles: string[] = [];

  // Tracks titles inserted earlier in THIS same confirm pass, so two
  // identical rows left in one voice plan (e.g. the user didn't
  // notice a duplicate before confirming) don't both get inserted.
  const insertedTaskTitles = new Set<string>();
  const insertedEventKeys = new Set<string>();

  for (const item of items) {
    try {
      const normalizedTitle = normalizeTitle(item.title);

      if (item.type === "task") {
        const isDuplicate =
          existingTasks.some(
            (task) =>
              !task.completed &&
              normalizeTitle(task.title) === normalizedTitle
          ) || insertedTaskTitles.has(normalizedTitle);

        if (isDuplicate) {
          skippedCount += 1;
          continue;
        }

        const createdTask = await insertTaskRow(supabase, userId, {
          title: item.title,
          priority: item.priority,
          due_date: item.date,
        });

        insertedTaskTitles.add(normalizedTitle);
        created.push({
          title: item.title,
          type: "task",
          status: "created",
        });

        await supabase.from("ai_messages").insert({
          user_id: userId,
          role: "assistant",
          content: formatCreatedTaskReply({
            title: createdTask.title,
            priority: createdTask.priority,
            due_date: createdTask.due_date,
          }),
          action: "create_task",
        });

        continue;
      }

      const eventKey = `${item.date}::${normalizedTitle}`;

      const isDuplicate =
        existingEvents.some(
          (event) =>
            event.event_date === item.date &&
            normalizeTitle(event.title) === normalizedTitle
        ) || insertedEventKeys.has(eventKey);

      if (isDuplicate) {
        skippedCount += 1;
        continue;
      }

      const linkedNote = buildLinkedContextNote(
        item.title,
        existingTasks,
        existingGoals
      );

      const createdEvent = await insertEventRow(supabase, userId, {
        title: item.title,
        description: linkedNote,
        event_date: item.date,
        start_time: item.start_time,
        end_time: item.end_time,
        category: item.category,
      });

      insertedEventKeys.add(eventKey);
      created.push({ title: item.title, type: "event", status: "created" });

      await supabase.from("ai_messages").insert({
        user_id: userId,
        role: "assistant",
        content: formatCreatedEventReply(createdEvent),
        action: "create_event",
      });
    } catch (itemError) {
      console.error(
        `Voice plan confirm: failed to save item "${item.title}":`,
        itemError
      );

      failedTitles.push(item.title);
    }
  }

  return {
    created,
    skippedCount,
    failedCount: failedTitles.length,
    failedTitles,
  };
}
