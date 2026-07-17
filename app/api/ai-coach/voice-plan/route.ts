import OpenAI from "openai";
import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase-server";
import { voicePlanRateLimit } from "@/app/lib/rate-limit";
import { getTodayDate, resolveTimeZone } from "../lib/dates";
import {
  MAX_AUDIO_FILE_BYTES,
  VOICE_PLAN_PARSING_MODEL,
  VOICE_TRANSCRIPTION_MODEL,
} from "../lib/voice-plan/constants";
import { buildVoicePlanPrompt } from "../lib/voice-plan/prompt";
import { voicePlanJsonSchema } from "../lib/voice-plan/schema";
import { sanitizeParsedPlanItems } from "../lib/voice-plan/parse-response";
import { detectConflicts } from "../lib/voice-plan/conflicts";
import type { VoicePlanResponse } from "../lib/voice-plan/types";

// This route is intentionally separate from /api/ai-coach: multi-item
// structured-output parsing is a different OpenAI call shape (no
// function-calling/tools involved at all) from the existing single
// action-per-message pipeline, and keeping it in its own file means
// zero risk of touching that pipeline's behavior.
export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error("OPENAI_API_KEY is missing.");

      return NextResponse.json<VoicePlanResponse>(
        {
          status: "error",
          error: "Orenios AI is temporarily unavailable.",
        },
        { status: 500 }
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json<VoicePlanResponse>(
        {
          status: "error",
          error: "Your session has expired. Please sign in again.",
        },
        { status: 401 }
      );
    }

    const { success: rateLimitSuccess, reset } =
      await voicePlanRateLimit.limit(user.id);

    if (!rateLimitSuccess) {
      return NextResponse.json<VoicePlanResponse>(
        {
          status: "error",
          error: "You've used your voice planning requests for now. Please try again later.",
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

    const formData = await request.formData();
    const audioEntry = formData.get("audio");
    const timeZone = resolveTimeZone(formData.get("timeZone"));

    if (!(audioEntry instanceof File) || audioEntry.size === 0) {
      return NextResponse.json<VoicePlanResponse>(
        {
          status: "error",
          error: "No audio was received. Please try recording again.",
        },
        { status: 400 }
      );
    }

    if (audioEntry.size > MAX_AUDIO_FILE_BYTES) {
      return NextResponse.json<VoicePlanResponse>(
        {
          status: "error",
          error: "That recording is too large. Please record a shorter plan.",
        },
        { status: 400 }
      );
    }

    const openai = new OpenAI({ apiKey });

    const transcription = await openai.audio.transcriptions.create({
      file: audioEntry,
      model: VOICE_TRANSCRIPTION_MODEL,
      language: "en",
    });

    const transcript = transcription.text.trim();

    if (!transcript) {
      return NextResponse.json<VoicePlanResponse>({
        status: "empty_transcript",
        transcript: "",
      });
    }

    const today = getTodayDate(timeZone);

    const response = await openai.responses.create({
      model: VOICE_PLAN_PARSING_MODEL,
      input: buildVoicePlanPrompt({
        transcript,
        currentDate: today,
        timeZone,
      }),
      text: {
        format: {
          type: "json_schema",
          name: "voice_day_plan",
          schema: voicePlanJsonSchema,
          strict: true,
        },
      },
    });

    const rawOutput = response.output_text?.trim();

    if (!rawOutput) {
      return NextResponse.json<VoicePlanResponse>({
        status: "no_items_found",
        transcript,
      });
    }

    let parsedRaw: unknown;

    try {
      parsedRaw = JSON.parse(rawOutput);
    } catch (error) {
      console.error("Voice plan: model output was not valid JSON:", error);

      return NextResponse.json<VoicePlanResponse>({
        status: "no_items_found",
        transcript,
      });
    }

    const rawItems =
      typeof parsedRaw === "object" &&
      parsedRaw !== null &&
      "items" in parsedRaw
        ? (parsedRaw as { items: unknown }).items
        : [];

    const { items } = sanitizeParsedPlanItems(rawItems);

    if (items.length === 0) {
      return NextResponse.json<VoicePlanResponse>({
        status: "no_items_found",
        transcript,
      });
    }

    const distinctDates = Array.from(
      new Set(items.map((item) => item.date))
    );

    const { data: existingEventsData, error: existingEventsError } =
      await supabase
        .from("calendar_events")
        .select("title, event_date, start_time, end_time")
        .eq("user_id", user.id)
        .in("event_date", distinctDates);

    if (existingEventsError) {
      console.error(
        "Voice plan: could not load existing calendar events for conflict check:",
        existingEventsError
      );
    }

    const itemsWithConflicts = detectConflicts(
      items,
      existingEventsData ?? []
    );

    return NextResponse.json<VoicePlanResponse>({
      status: "ok",
      transcript,
      items: itemsWithConflicts,
      existingEvents: existingEventsData ?? [],
    });
  } catch (error) {
    console.error("Voice plan route error:", error);

    return NextResponse.json<VoicePlanResponse>(
      {
        status: "error",
        error: "Something went wrong while processing your voice plan.",
      },
      { status: 500 }
    );
  }
}
