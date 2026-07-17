import { createClient } from "../../../lib/supabase-server";

import { normalizeTitle } from "./task-matcher";
import { parseSetDailyFocusArguments } from "./focus-parsers";

import type { DailyFocusRecord } from "./types";

type SupabaseClient = Awaited<
  ReturnType<typeof createClient>
>;

type ExecuteFocusActionArguments = {
  functionName: string;
  rawArguments: string;
  supabase: SupabaseClient;
  userId: string;
  today: string;
  existingFocus: DailyFocusRecord | null;
};

type FocusActionResult = {
  handled: boolean;
  reply: string;
  action: string | null;
};

const focusSelect = "id, title, description, progress, focus_date";

export async function executeFocusAction({
  functionName,
  rawArguments,
  supabase,
  userId,
  today,
  existingFocus,
}: ExecuteFocusActionArguments): Promise<FocusActionResult> {
  if (functionName !== "set_daily_focus") {
    return {
      handled: false,
      reply: "",
      action: null,
    };
  }

  const focusArguments = parseSetDailyFocusArguments(rawArguments);

  // Mirrors the manual Daily Focus form: one row per user per day,
  // upserted on (user_id, focus_date). Progress tracks completion of a
  // specific objective, so it only carries over when the title is
  // unchanged (the user is just re-stating it or editing the "why it
  // matters" description) — swapping to a genuinely different
  // objective starts that objective's progress at 0 rather than
  // showing stale, no-longer-meaningful progress against a new title.
  const isSameObjective =
    existingFocus !== null &&
    normalizeTitle(existingFocus.title) ===
      normalizeTitle(focusArguments.title);

  const nextProgress = isSameObjective
    ? existingFocus!.progress
    : 0;

  const { data: savedFocus, error: saveFocusError } = await supabase
    .from("daily_focus")
    .upsert(
      {
        user_id: userId,
        focus_date: today,
        title: focusArguments.title,
        description: focusArguments.description,
        progress: nextProgress,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,focus_date",
      }
    )
    .select(focusSelect)
    .single();

  if (saveFocusError || !savedFocus) {
    console.error(
      "Could not set AI daily focus:",
      saveFocusError
    );

    throw new Error(
      "Orenios understood the request but could not save today's focus."
    );
  }

  const verb = existingFocus ? "updated" : "set";

  return {
    handled: true,
    action: "set_daily_focus",
    reply: `✅ Today's focus ${verb}: "${savedFocus.title}".`,
  };
}
