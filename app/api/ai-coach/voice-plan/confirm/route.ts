import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase-server";
import { aiCoachRateLimit } from "@/app/lib/rate-limit";
import { normalizeTitle } from "../../lib/task-matcher";
import { insertTaskRow } from "../../lib/task-actions";
import { insertEventRow, formatCreatedEventReply } from "../../lib/event-actions";
import { formatCreatedTaskReply } from "../../lib/task-replies";
import { sanitizeParsedPlanItems } from "../../lib/voice-plan/parse-response";
import { buildLinkedContextNote } from "../../lib/voice-plan/linking";
import type {
  ConfirmedItemResult,
  VoicePlanConfirmResponse,
} from "../../lib/voice-plan/types";
import type { EventRecord, GoalRecord, TaskRecord } from "../../lib/types";

// Confirm step: takes the (possibly user-edited) item list the client
// currently has in the preview and actually writes it. Re-validates
// and re-derives everything server-side rather than trusting the
// request body — the client's job is to display and let the user
// edit, not to be the source of truth for what gets inserted.
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json<VoicePlanConfirmResponse>(
        {
          status: "error",
          error: "Your session has expired. Please sign in again.",
        },
        { status: 401 }
      );
    }

    // Confirm doesn't call OpenAI at all (no transcription, no
    // parsing) — it's a batch of database writes, so it shares the
    // normal text AI Coach's rate limit rather than the stricter
    // voice-plan one, which exists specifically to bound OpenAI cost.
    const { success: rateLimitSuccess, reset } =
      await aiCoachRateLimit.limit(user.id);

    if (!rateLimitSuccess) {
      return NextResponse.json<VoicePlanConfirmResponse>(
        {
          status: "error",
          error: "You are sending requests too quickly. Please wait a moment.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.max(
              1,
              Math.ceil((reset - Date.now()) / 1000)
            ).toString(),
          },
        }
      );
    }

    const body = await request.json().catch(() => null);
    const rawItems = Array.isArray(body?.items) ? body.items : [];
    const { items } = sanitizeParsedPlanItems(rawItems);

    if (items.length === 0) {
      return NextResponse.json<VoicePlanConfirmResponse>(
        {
          status: "error",
          error: "There's nothing valid to add — please try again.",
        },
        { status: 400 }
      );
    }

    const [tasksResult, goalsResult, eventsResult] = await Promise.all([
      supabase
        .from("tasks")
        .select("id, title, completed, priority, due_date, created_at")
        .eq("user_id", user.id),
      supabase
        .from("goals")
        .select(
          "id, title, description, progress, status, deadline, created_at"
        )
        .eq("user_id", user.id),
      supabase
        .from("calendar_events")
        .select(
          "id, title, description, event_date, start_time, end_time, category, created_at"
        )
        .eq("user_id", user.id),
    ]);

    if (tasksResult.error || goalsResult.error || eventsResult.error) {
      console.error(
        "Voice plan confirm: could not load workspace data:",
        tasksResult.error || goalsResult.error || eventsResult.error
      );

      return NextResponse.json<VoicePlanConfirmResponse>(
        {
          status: "error",
          error: "Orenios could not load your workspace to confirm this plan.",
        },
        { status: 500 }
      );
    }

    const existingTasks = (tasksResult.data ?? []) as TaskRecord[];
    const existingGoals = (goalsResult.data ?? []) as GoalRecord[];
    const existingEvents = (eventsResult.data ?? []) as EventRecord[];

    const created: ConfirmedItemResult[] = [];
    let skippedCount = 0;
    const failedTitles: string[] = [];

    // Tracks titles inserted earlier in THIS same confirm pass, so two
    // identical rows left in one voice plan (e.g. the user didn't
    // notice a duplicate before confirming) don't both get inserted.
    const insertedTaskTitles = new Set<string>();
    const insertedEventKeys = new Set<string>();

    // Each item is inserted independently: if one item's DB write fails
    // partway through the batch, the rest of the plan should still go
    // through rather than the whole confirm aborting and leaving the
    // user unsure which of their events/tasks actually got saved.
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

          const createdTask = await insertTaskRow(supabase, user.id, {
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
            user_id: user.id,
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

        const createdEvent = await insertEventRow(supabase, user.id, {
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
          user_id: user.id,
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

    return NextResponse.json<VoicePlanConfirmResponse>({
      status: "ok",
      created,
      skippedCount,
      failedCount: failedTitles.length,
      failedTitles,
    });
  } catch (error) {
    console.error("Voice plan confirm route error:", error);

    return NextResponse.json<VoicePlanConfirmResponse>(
      {
        status: "error",
        error: "Something went wrong while saving your plan.",
      },
      { status: 500 }
    );
  }
}
