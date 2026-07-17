import { describe, expect, it } from "vitest";

import { isValidDateKey } from "../app/api/ai-coach/lib/dates";
import { normalizeGoalTitle } from "../app/api/ai-coach/lib/goal-matcher";
import {
  parseCreateGoalArguments,
  parseUpdateGoalArguments,
} from "../app/api/ai-coach/lib/goal-parsers";
import { normalizeTitle } from "../app/api/ai-coach/lib/task-matcher";
import { executeTaskAction } from "../app/api/ai-coach/lib/task-actions";
import { executeEventAction } from "../app/api/ai-coach/lib/event-actions";
import { executeFocusAction } from "../app/api/ai-coach/lib/focus-actions";
import { runActionSafely } from "../app/api/ai-coach/lib/safe-execute";
import type {
  DailyFocusRecord,
  EventRecord,
} from "../app/api/ai-coach/lib/types";
import {
  getGoalStatusForProgress,
  normalizeGoalState,
} from "../app/lib/goal-state";

describe("AI Coach date validation", () => {
  it.each([
    "2026-01-01",
    "2026-12-31",
    "2024-02-29",
  ])("accepts the real calendar date %s", (date) => {
    expect(isValidDateKey(date)).toBe(true);
  });

  it.each([
    "2026-02-29",
    "2026-02-31",
    "2026-04-31",
    "2026-13-01",
    "2026-00-10",
    "2026-01-00",
    "26-01-01",
  ])("rejects the invalid calendar date %s", (date) => {
    expect(isValidDateKey(date)).toBe(false);
  });

  it("rejects an impossible goal deadline", () => {
    expect(() =>
      parseCreateGoalArguments(
        JSON.stringify({
          title: "Launch Orenios",
          deadline: "2026-02-31",
        })
      )
    ).toThrow("valid YYYY-MM-DD");
  });
});

describe("AI Coach title normalization", () => {
  it("normalizes smart quotes for goals and tasks consistently", () => {
    expect(normalizeGoalTitle("“Launch Orenios”")).toBe(
      "launch orenios"
    );
    expect(normalizeTitle("“Launch Orenios”")).toBe(
      "launch orenios"
    );
  });
});

describe("goal status and progress invariants", () => {
  it("derives status from boundary progress values", () => {
    expect(getGoalStatusForProgress(0)).toBe("Not Started");
    expect(getGoalStatusForProgress(50)).toBe("In Progress");
    expect(getGoalStatusForProgress(100)).toBe("Completed");
  });

  it("forces completed and not-started boundary progress", () => {
    expect(
      normalizeGoalState({
        status: "Completed",
        progress: 20,
      })
    ).toEqual({
      status: "Completed",
      progress: 100,
    });

    expect(
      normalizeGoalState({
        status: "Not Started",
        progress: 80,
      })
    ).toEqual({
      status: "Not Started",
      progress: 0,
    });
  });

  it("keeps in-progress goals strictly between 1 and 99", () => {
    expect(
      normalizeGoalState({
        status: "In Progress",
        progress: 0,
      }).progress
    ).toBe(1);

    expect(
      normalizeGoalState({
        status: "In Progress",
        progress: 100,
      }).progress
    ).toBe(99);
  });

  it("rejects an explicitly inconsistent AI goal update", () => {
    expect(() =>
      parseUpdateGoalArguments(
        JSON.stringify({
          title: "Launch Orenios",
          status: "Completed",
          progress: 50,
        })
      )
    ).toThrow("100 percent progress");
  });
});

describe("AI Coach action error handling", () => {
  it("turns a no-op task update into a conversational reply instead of throwing", async () => {
    // Repro: "move the dentist appointment to 6pm instead" — the model
    // has no update_event tool, so it calls update_task on an item that
    // isn't a task, with no field it can actually change. This used to
    // throw all the way out to route.ts's outer catch and surface as an
    // HTTP 500 "Something went wrong" instead of a normal chat reply.
    const result = await runActionSafely("task", () =>
      executeTaskAction({
        functionName: "update_task",
        rawArguments: JSON.stringify({
          title: "dentist appointment",
          new_title: null,
          priority: null,
          due_date: null,
          remove_due_date: false,
        }),
        supabase: {} as never,
        userId: "test-user",
        tasks: [
          {
            id: "1",
            title: "dentist appointment",
            completed: false,
            priority: "medium",
            due_date: null,
            created_at: new Date().toISOString(),
          },
        ],
      })
    );

    expect(result.handled).toBe(true);
    expect(result.action).toBeNull();
    expect(result.reply.length).toBeGreaterThan(0);
    expect(result.reply).not.toMatch(/^Error/);
  });

  it("does not swallow unrelated errors as blank replies", async () => {
    const result = await runActionSafely("task", () => {
      throw new Error("");
    });

    expect(result.handled).toBe(true);
    expect(result.reply.length).toBeGreaterThan(0);
  });
});

describe("AI Coach event ambiguity handling", () => {
  // Live testing against the real endpoint repeatedly showed the model
  // reasoning its way to a clarifying question in plain text before
  // ever calling delete_event/update_event when three same-titled
  // events exist — a reasonable UX outcome, but it means the server's
  // own ambiguous-match branch is rarely exercised by the model's
  // choices. These tests call executeEventAction directly with the
  // exact ambiguous shape (three "Team sync" events, no date given) to
  // prove that branch is correct on its own, independent of whether
  // the model happens to reach it.
  const threeSameTitledEvents: EventRecord[] = [
    {
      id: "evt-1",
      title: "Team sync",
      description: null,
      event_date: "2026-07-20",
      start_time: "09:00:00",
      end_time: null,
      category: "Work",
      created_at: new Date().toISOString(),
    },
    {
      id: "evt-2",
      title: "Team sync",
      description: null,
      event_date: "2026-07-22",
      start_time: "09:00:00",
      end_time: null,
      category: "Work",
      created_at: new Date().toISOString(),
    },
    {
      id: "evt-3",
      title: "Team sync",
      description: null,
      event_date: "2026-07-24",
      start_time: "09:00:00",
      end_time: null,
      category: "Work",
      created_at: new Date().toISOString(),
    },
  ];

  it("asks which event to delete instead of guessing one, when no date narrows it down", async () => {
    const result = await executeEventAction({
      functionName: "delete_event",
      rawArguments: JSON.stringify({
        title: "Team sync",
        event_date: null,
      }),
      supabase: {} as never,
      userId: "test-user",
      events: threeSameTitledEvents,
    });

    expect(result.handled).toBe(true);
    expect(result.action).toBe("delete_event");
    expect(result.reply).toMatch(/2026-07-20/);
    expect(result.reply).toMatch(/2026-07-22/);
    expect(result.reply).toMatch(/2026-07-24/);
    expect(result.reply.toLowerCase()).toMatch(/which one/);
  });

  it("asks which event to update instead of guessing one, when no date narrows it down", async () => {
    const result = await executeEventAction({
      functionName: "update_event",
      rawArguments: JSON.stringify({
        title: "Team sync",
        event_date: null,
        new_title: null,
        new_event_date: null,
        start_time: "17:00",
        end_time: null,
        remove_end_time: false,
        category: null,
      }),
      supabase: {} as never,
      userId: "test-user",
      events: threeSameTitledEvents,
    });

    expect(result.handled).toBe(true);
    expect(result.action).toBe("update_event");
    expect(result.reply).toMatch(/2026-07-20/);
    expect(result.reply).toMatch(/2026-07-22/);
    expect(result.reply).toMatch(/2026-07-24/);
    expect(result.reply.toLowerCase()).toMatch(/which one/);
  });

  it("resolves unambiguously once a date narrows the match to exactly one event", async () => {
    const result = await executeEventAction({
      functionName: "delete_event",
      rawArguments: JSON.stringify({
        title: "Team sync",
        event_date: "2026-07-22",
      }),
      supabase: {
        from: () => ({
          delete: () => ({
            eq: () => ({
              eq: () => ({
                select: () => ({
                  single: async () => ({
                    data: threeSameTitledEvents[1],
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        }),
      } as never,
      userId: "test-user",
      events: threeSameTitledEvents,
    });

    expect(result.handled).toBe(true);
    expect(result.action).toBe("delete_event");
    expect(result.reply).toMatch(/2026-07-22/);
  });
});

describe("AI Coach daily focus progress handling", () => {
  function buildFocusSupabaseMock() {
    let capturedUpsert: Record<string, unknown> | null = null;

    const supabase = {
      from: () => ({
        upsert: (payload: Record<string, unknown>) => {
          capturedUpsert = payload;

          return {
            select: () => ({
              single: async () => ({
                data: {
                  id: "focus-1",
                  title: payload.title,
                  description: payload.description,
                  progress: payload.progress,
                  focus_date: payload.focus_date,
                },
                error: null,
              }),
            }),
          };
        },
      }),
    };

    return {
      supabase: supabase as never,
      getCapturedUpsert: () => capturedUpsert,
    };
  }

  it("resets progress to 0 when the objective actually changes", async () => {
    const { supabase, getCapturedUpsert } = buildFocusSupabaseMock();

    const existingFocus: DailyFocusRecord = {
      id: "focus-1",
      title: "fixing the payment bug",
      description: null,
      progress: 45,
      focus_date: "2026-07-17",
    };

    const result = await executeFocusAction({
      functionName: "set_daily_focus",
      rawArguments: JSON.stringify({
        title: "answering support emails",
        description: null,
      }),
      supabase,
      userId: "test-user",
      today: "2026-07-17",
      existingFocus,
    });

    expect(result.handled).toBe(true);
    expect(result.reply).toMatch(/updated/);
    expect(getCapturedUpsert()?.progress).toBe(0);
  });

  it("preserves progress when the objective is only re-stated", async () => {
    const { supabase, getCapturedUpsert } = buildFocusSupabaseMock();

    const existingFocus: DailyFocusRecord = {
      id: "focus-1",
      title: "fixing the payment bug",
      description: null,
      progress: 45,
      focus_date: "2026-07-17",
    };

    const result = await executeFocusAction({
      functionName: "set_daily_focus",
      rawArguments: JSON.stringify({
        title: "Fixing the payment bug",
        description: "top priority",
      }),
      supabase,
      userId: "test-user",
      today: "2026-07-17",
      existingFocus,
    });

    expect(result.handled).toBe(true);
    expect(getCapturedUpsert()?.progress).toBe(45);
  });

  it("starts a brand-new focus at 0 progress", async () => {
    const { supabase, getCapturedUpsert } = buildFocusSupabaseMock();

    const result = await executeFocusAction({
      functionName: "set_daily_focus",
      rawArguments: JSON.stringify({
        title: "finishing the pitch deck",
        description: null,
      }),
      supabase,
      userId: "test-user",
      today: "2026-07-17",
      existingFocus: null,
    });

    expect(result.handled).toBe(true);
    expect(result.reply).toMatch(/set/);
    expect(getCapturedUpsert()?.progress).toBe(0);
  });
});
