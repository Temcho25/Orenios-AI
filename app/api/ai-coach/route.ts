import OpenAI from "openai";
import { NextResponse } from "next/server";
import { createClient } from "../../lib/supabase-server";
import { formatConversationHistory } from "./lib/conversation";
import { aiCoachTools } from "./lib/tools";
import { buildAICoachPrompt } from "./lib/prompt";
import { executeTaskAction } from "./lib/task-actions";
import {
  getTodayDate,
  getFutureDate,
  isValidDateKey,
} from "./lib/dates";
import type {
  StoredAIMessage,
  TaskPriority,
  CreateTaskArguments,
  CompleteTaskArguments,
  DeleteTaskArguments,
  UpdateTaskArguments,
  TaskRecord,
} from "./lib/types";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const taskSelect =
  "id, title, completed, priority, due_date, created_at";
export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error: "OpenAI API key is missing.",
        },
        {
          status: 500,
        }
      );
    }

    const body = await request.json();

    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : "";

    if (!message) {
      return NextResponse.json(
        {
          error: "Please enter a message.",
        },
        {
          status: 400,
        }
      );
    }

    if (message.length > 1000) {
      return NextResponse.json(
        {
          error: "Your message is too long.",
        },
        {
          status: 400,
        }
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error:
            "Your session has expired. Please sign in again.",
        },
        {
          status: 401,
        }
      );
    }

    const today = getTodayDate();
    const upcomingDate = getFutureDate(14);

    const [
      tasksResult,
      goalsResult,
      focusResult,
      calendarResult,
      notesResult,
      profileResult,
      historyResult,
    ] = await Promise.all([
      supabase
        .from("tasks")
        .select(taskSelect)
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        })
        .limit(50),

      supabase
        .from("goals")
        .select(
          "id, title, description, progress, status, deadline, created_at"
        )
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        })
        .limit(20),

      supabase
        .from("daily_focus")
        .select(
          "id, title, description, progress, focus_date"
        )
        .eq("user_id", user.id)
        .eq("focus_date", today)
        .maybeSingle(),

      supabase
        .from("calendar_events")
        .select(
          "id, title, description, event_date, start_time, end_time, category"
        )
        .eq("user_id", user.id)
        .gte("event_date", today)
        .lte("event_date", upcomingDate)
        .order("event_date", {
          ascending: true,
        })
        .order("start_time", {
          ascending: true,
        })
        .limit(30),

      supabase
        .from("notes")
        .select(
          "id, title, content, created_at, updated_at"
        )
        .eq("user_id", user.id)
        .order("updated_at", {
          ascending: false,
        })
        .limit(10),

      supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", user.id)
        .maybeSingle(),

      supabase
        .from("ai_messages")
        .select("role, content, created_at")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        })
        .limit(20),
    ]);

    const databaseError =
      tasksResult.error ||
      goalsResult.error ||
      focusResult.error ||
      calendarResult.error ||
      notesResult.error ||
      profileResult.error ||
      historyResult.error;

    if (databaseError) {
      console.error(
        "AI Coach database error:",
        databaseError
      );

      return NextResponse.json(
        {
          error:
            "Orenios could not load your workspace data.",
        },
        {
          status: 500,
        }
      );
    }

    const tasks =
      (tasksResult.data ?? []) as TaskRecord[];

    const firstName =
      profileResult.data?.first_name?.trim() ||
      user.user_metadata?.full_name
        ?.trim()
        ?.split(" ")[0] ||
      "there";

    const notesForAI = (notesResult.data ?? []).map(
      (note) => ({
        title: note.title,
        content:
          typeof note.content === "string"
            ? note.content.slice(0, 1000)
            : null,
        updated_at: note.updated_at,
      })
    );

    const previousMessages = (
      (historyResult.data ?? []) as StoredAIMessage[]
    ).reverse();

    const conversationHistory =
      formatConversationHistory(previousMessages);

    const workspaceContext = {
      user: {
        first_name: firstName,
        email: user.email ?? null,
      },
      current_date: today,
      todays_focus: focusResult.data ?? null,
      tasks,
      goals: goalsResult.data ?? [],
      upcoming_calendar_events:
        calendarResult.data ?? [],
      recent_notes: notesForAI,
    };

    const { error: userMessageSaveError } =
      await supabase.from("ai_messages").insert({
        user_id: user.id,
        role: "user",
        content: message,
      });

    if (userMessageSaveError) {
      console.error(
        "Could not save user AI message:",
        userMessageSaveError
      );

      return NextResponse.json(
        {
          error:
            "Orenios could not save your message.",
        },
        {
          status: 500,
        }
      );
    }

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",

      tools: aiCoachTools,
input: buildAICoachPrompt({
  workspaceContext,
  conversationHistory,
  message,
}),
    });

    const functionCall = response.output.find(
      (outputItem) =>
        outputItem.type === "function_call"
    );
let reply = "";
let action: string | null = null;

if (
  functionCall &&
  functionCall.type === "function_call"
) {
  const taskResult = await executeTaskAction({
    functionName: functionCall.name,
    rawArguments: functionCall.arguments,
    supabase,
    userId: user.id,
    tasks,
  });

  if (taskResult.handled) {
    reply = taskResult.reply;
    action = taskResult.action;
  }
}

if (!reply) {
  const generatedReply =
    response.output_text?.trim();

  if (!generatedReply) {
    return NextResponse.json(
      {
        error:
          "Orenios returned an empty response.",
      },
      {
        status: 500,
      }
    );
  }

  reply = generatedReply;
}
    const { error: assistantMessageSaveError } =
      await supabase.from("ai_messages").insert({
        user_id: user.id,
        role: "assistant",
        content: reply,
      });

    if (assistantMessageSaveError) {
      console.error(
        "Could not save assistant AI message:",
        assistantMessageSaveError
      );

      return NextResponse.json(
        {
          error:
            "Orenios completed the request but could not save its response.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      reply,
      action,
    });
  } catch (error) {
    console.error(
      "AI Coach route error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while contacting Orenios.",
      },
      {
        status: 500,
      }
    );
  }
}