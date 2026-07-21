import OpenAI from "openai";
import { NextResponse } from "next/server";
import { createClient } from "../../lib/supabase-server";
import { aiCoachRateLimit, getAiCoachDailyLimit } from "@/app/lib/rate-limit";
import { getSubscription } from "@/app/lib/subscription";
import { formatConversationHistory } from "./lib/conversation";
import { aiCoachTools } from "./lib/tools";
import { buildAICoachPrompt } from "./lib/prompt";
import { executeTaskAction } from "./lib/task-actions";
import { executeGoalAction } from "./lib/goal-actions";
import { executeEventAction } from "./lib/event-actions";
import { executeNoteAction } from "./lib/note-actions";
import { executeFocusAction } from "./lib/focus-actions";
import { runActionSafely } from "./lib/safe-execute";
import {
  getCrossTypeAmbiguityReply,
  resolveReferencedAction,
} from "./lib/references";
import {
  getTodayDate,
  getFutureDate,
  resolveTimeZone,
} from "./lib/dates";
import type {
  StoredAIMessage,
  TaskRecord,
  GoalRecord,
  EventRecord,
  NoteRecord,
  DailyFocusRecord,
} from "./lib/types";

const taskSelect =
  "id, title, completed, priority, due_date, created_at";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error("OPENAI_API_KEY is missing.");

      return NextResponse.json(
        {
          error: "Orenios AI is temporarily unavailable.",
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

    const timeZone = resolveTimeZone(body.timeZone);
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error: "Your session has expired. Please sign in again.",
        },
        {
          status: 401,
        }
      );
    }

    const {
      success: rateLimitSuccess,
      reset,
    } = await aiCoachRateLimit.limit(user.id);

    if (!rateLimitSuccess) {
      return NextResponse.json(
        {
          error:
            "You are sending messages too quickly. Please wait a moment.",
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

    const subscription = await getSubscription(supabase, user.id);
    const planTier = subscription?.hasAccess ? subscription.planTier : null;
    const dailyLimit = getAiCoachDailyLimit(planTier);

    if (dailyLimit) {
      const { success: dailyQuotaOk, reset: dailyReset } =
        await dailyLimit.limit(user.id);

      if (!dailyQuotaOk) {
        return NextResponse.json(
          {
            error:
              "You've reached today's message limit for your plan. It resets tomorrow, or you can upgrade for a higher limit.",
          },
          {
            status: 429,
            headers: {
              "Retry-After": Math.max(
                1,
                Math.ceil((dailyReset - Date.now()) / 1000)
              ).toString(),
            },
          }
        );
      }
    }

    const openai = new OpenAI({
      apiKey,
    });

    const today = getTodayDate(timeZone);
    const upcomingDate = getFutureDate(14, timeZone);

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
        .select("first_name, last_name, onboarding_focus")
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
      console.error("AI Coach database error:", databaseError);

      return NextResponse.json(
        {
          error: "Orenios could not load your workspace data.",
        },
        {
          status: 500,
        }
      );
    }

    const tasks =
      (tasksResult.data ?? []) as TaskRecord[];

    const goals =
      (goalsResult.data ?? []) as GoalRecord[];

    const events =
      (calendarResult.data ?? []) as EventRecord[];

    const notes =
      (notesResult.data ?? []) as NoteRecord[];

    const existingFocus =
      (focusResult.data ?? null) as DailyFocusRecord | null;

    const firstName =
      profileResult.data?.first_name?.trim() ||
      user.user_metadata?.full_name
        ?.trim()
        ?.split(" ")[0] ||
      "there";

    const primaryFocusArea =
      profileResult.data?.onboarding_focus?.trim() || null;

    const notesForAI = notes.map(
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
        primary_focus_area: primaryFocusArea,
      },
      current_date: today,
      time_zone: timeZone,
      todays_focus: existingFocus,
      tasks,
      goals,
      upcoming_calendar_events: events,
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
          error: "Orenios could not save your message.",
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
      const referencedAction = resolveReferencedAction({
        message,
        previousMessages,
        functionName: functionCall.name,
        rawArguments: functionCall.arguments,
      });

      const crossTypeAmbiguityReply =
        getCrossTypeAmbiguityReply({
          message,
          functionName: referencedAction.functionName,
          rawArguments: referencedAction.rawArguments,
          tasks,
          goals,
        });

      if (crossTypeAmbiguityReply) {
        reply = crossTypeAmbiguityReply;
      } else {
        const taskResult = await runActionSafely("task", () =>
          executeTaskAction({
            functionName: referencedAction.functionName,
            rawArguments: referencedAction.rawArguments,
            supabase,
            userId: user.id,
            tasks,
          })
        );

        if (taskResult.handled) {
          reply = taskResult.reply;
          action = taskResult.action;
        } else {
          const goalResult = await runActionSafely("goal", () =>
            executeGoalAction({
              functionName: referencedAction.functionName,
              rawArguments: referencedAction.rawArguments,
              supabase,
              userId: user.id,
              goals,
            })
          );

          if (goalResult.handled) {
            reply = goalResult.reply;
            action = goalResult.action;
          } else {
            const eventResult = await runActionSafely("event", () =>
              executeEventAction({
                functionName: referencedAction.functionName,
                rawArguments: referencedAction.rawArguments,
                supabase,
                userId: user.id,
                events,
              })
            );

            if (eventResult.handled) {
              reply = eventResult.reply;
              action = eventResult.action;
            } else {
              const noteResult = await runActionSafely("note", () =>
                executeNoteAction({
                  functionName: referencedAction.functionName,
                  rawArguments: referencedAction.rawArguments,
                  supabase,
                  userId: user.id,
                  notes,
                })
              );

              if (noteResult.handled) {
                reply = noteResult.reply;
                action = noteResult.action;
              } else {
                const focusResultFromAction = await runActionSafely(
                  "focus",
                  () =>
                    executeFocusAction({
                      functionName: referencedAction.functionName,
                      rawArguments: referencedAction.rawArguments,
                      supabase,
                      userId: user.id,
                      today,
                      existingFocus,
                    })
                );

                if (focusResultFromAction.handled) {
                  reply = focusResultFromAction.reply;
                  action = focusResultFromAction.action;
                }
              }
            }
          }
        }
      }
    }

    if (!reply) {
      const generatedReply =
        response.output_text?.trim();

      if (!generatedReply) {
        return NextResponse.json(
          {
            error: "Orenios returned an empty response.",
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
        action,
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
    console.error("AI Coach route error:", error);

    return NextResponse.json(
      {
        error:
          "Something went wrong while contacting Orenios.",
      },
      {
        status: 500,
      }
    );
  }
}
