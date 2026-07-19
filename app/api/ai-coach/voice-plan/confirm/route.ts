import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase-server";
import { aiCoachRateLimit } from "@/app/lib/rate-limit";
import { sanitizeParsedPlanItems } from "../../lib/voice-plan/parse-response";
import { confirmPlanItems } from "../../lib/voice-plan/confirm-items";
import type { VoicePlanConfirmResponse } from "../../lib/voice-plan/types";
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

    const { created, skippedCount, failedCount, failedTitles } =
      await confirmPlanItems({
        items,
        supabase,
        userId: user.id,
        existingTasks,
        existingGoals,
        existingEvents,
      });

    return NextResponse.json<VoicePlanConfirmResponse>({
      status: "ok",
      created,
      skippedCount,
      failedCount,
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
