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
import { executeGoalAction } from "../app/api/ai-coach/lib/goal-actions";
import { runActionSafely } from "../app/api/ai-coach/lib/safe-execute";
import { sanitizeParsedPlanItems } from "../app/api/ai-coach/lib/voice-plan/parse-response";
import { buildLinkedContextNote } from "../app/api/ai-coach/lib/voice-plan/linking";
import { confirmPlanItems } from "../app/api/ai-coach/lib/voice-plan/confirm-items";
import {
  detectConflicts,
  doTimeRangesOverlap,
} from "../app/api/ai-coach/lib/voice-plan/conflicts";
import type { ParsedPlanItem } from "../app/api/ai-coach/lib/voice-plan/types";
import type {
  DailyFocusRecord,
  EventRecord,
  GoalRecord,
  TaskRecord,
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

describe("AI Coach goal action handling", () => {
  const activeGoal: GoalRecord = {
    id: "goal-1",
    title: "Launch Orenios",
    description: null,
    progress: 20,
    status: "In Progress",
    deadline: null,
    created_at: new Date().toISOString(),
  };

  function buildGoalSupabaseMock(returnedGoal: GoalRecord) {
    let capturedPayload: Record<string, unknown> | null = null;

    const chain = {
      eq: () => chain,
      neq: () => chain,
      select: () => ({
        single: async () => ({ data: returnedGoal, error: null }),
      }),
    };

    const supabase = {
      from: () => ({
        insert: (payload: Record<string, unknown>) => {
          capturedPayload = payload;
          return chain;
        },
        update: (payload: Record<string, unknown>) => {
          capturedPayload = payload;
          return chain;
        },
        delete: () => chain,
      }),
    };

    return {
      supabase: supabase as never,
      getCapturedPayload: () => capturedPayload,
    };
  }

  it("creates a new goal and returns a confirmation reply", async () => {
    const { supabase } = buildGoalSupabaseMock({
      ...activeGoal,
      id: "goal-2",
      title: "Ship the MVP",
      progress: 0,
      status: "Not Started",
    });

    const result = await executeGoalAction({
      functionName: "create_goal",
      rawArguments: JSON.stringify({
        title: "Ship the MVP",
        description: null,
        deadline: null,
      }),
      supabase,
      userId: "test-user",
      goals: [activeGoal],
    });

    expect(result.handled).toBe(true);
    expect(result.action).toBe("create_goal");
    expect(result.reply).toMatch(/Ship the MVP/);
  });

  it("refuses to create a duplicate of an existing active goal", async () => {
    const { supabase } = buildGoalSupabaseMock(activeGoal);

    const result = await executeGoalAction({
      functionName: "create_goal",
      rawArguments: JSON.stringify({
        title: "launch orenios", // different case, same normalized title
        description: null,
        deadline: null,
      }),
      supabase,
      userId: "test-user",
      goals: [activeGoal],
    });

    expect(result.handled).toBe(true);
    expect(result.reply).toMatch(/already exists/);
  });

  it("turns a no-op AI goal update into a conversational reply instead of throwing", async () => {
    // Mirrors the equivalent task-action test: parseUpdateGoalArguments
    // throws "No goal changes were requested." when every optional
    // field is empty — runActionSafely must turn that into a normal
    // chat reply, not an HTTP 500.
    const result = await runActionSafely("goal", () =>
      executeGoalAction({
        functionName: "update_goal",
        rawArguments: JSON.stringify({
          title: "Launch Orenios",
          new_title: null,
          description: null,
          remove_description: false,
          progress: null,
          status: null,
          deadline: null,
          remove_deadline: false,
        }),
        supabase: {} as never,
        userId: "test-user",
        goals: [activeGoal],
      })
    );

    expect(result.handled).toBe(true);
    expect(result.action).toBeNull();
    expect(result.reply.length).toBeGreaterThan(0);
    expect(result.reply).not.toMatch(/^Error/);
  });

  const twoSameTitledActiveGoals: GoalRecord[] = [
    {
      id: "goal-a",
      title: "Read more books",
      description: null,
      progress: 10,
      status: "In Progress",
      deadline: null,
      created_at: new Date().toISOString(),
    },
    {
      id: "goal-b",
      title: "Read more books",
      description: null,
      progress: 40,
      status: "In Progress",
      deadline: null,
      created_at: new Date().toISOString(),
    },
  ];

  it("asks which goal to complete when multiple active goals share a title", async () => {
    const result = await executeGoalAction({
      functionName: "complete_goal",
      rawArguments: JSON.stringify({ title: "Read more books" }),
      supabase: {} as never,
      userId: "test-user",
      goals: twoSameTitledActiveGoals,
    });

    expect(result.handled).toBe(true);
    expect(result.action).toBe("complete_goal");
    expect(result.reply.toLowerCase()).toMatch(/which one/);
  });

  it("asks which goal to delete when multiple goals share a title", async () => {
    const result = await executeGoalAction({
      functionName: "delete_goal",
      rawArguments: JSON.stringify({ title: "Read more books" }),
      supabase: {} as never,
      userId: "test-user",
      goals: twoSameTitledActiveGoals,
    });

    expect(result.handled).toBe(true);
    expect(result.action).toBe("delete_goal");
    expect(result.reply.toLowerCase()).toMatch(/which one/);
  });

  it("reports when no active goal matches the requested title", async () => {
    const result = await executeGoalAction({
      functionName: "complete_goal",
      rawArguments: JSON.stringify({ title: "Learn to sail" }),
      supabase: {} as never,
      userId: "test-user",
      goals: [activeGoal],
    });

    expect(result.handled).toBe(true);
    expect(result.reply).toMatch(/couldn.t find/i);
  });

  it("completes a goal that resolves unambiguously", async () => {
    const { supabase } = buildGoalSupabaseMock({
      ...activeGoal,
      progress: 100,
      status: "Completed",
    });

    const result = await executeGoalAction({
      functionName: "complete_goal",
      rawArguments: JSON.stringify({ title: "Launch Orenios" }),
      supabase,
      userId: "test-user",
      goals: [activeGoal],
    });

    expect(result.handled).toBe(true);
    expect(result.action).toBe("complete_goal");
    expect(result.reply).toMatch(/Goal completed/);
  });

  it("updates a goal's progress and status together", async () => {
    const { supabase, getCapturedPayload } = buildGoalSupabaseMock({
      ...activeGoal,
      progress: 75,
      status: "In Progress",
    });

    const result = await executeGoalAction({
      functionName: "update_goal",
      rawArguments: JSON.stringify({
        title: "Launch Orenios",
        new_title: null,
        description: null,
        remove_description: false,
        progress: 75,
        status: null,
        deadline: null,
        remove_deadline: false,
      }),
      supabase,
      userId: "test-user",
      goals: [activeGoal],
    });

    expect(result.handled).toBe(true);
    expect(result.action).toBe("update_goal");
    expect(getCapturedPayload()?.progress).toBe(75);
    expect(getCapturedPayload()?.status).toBe("In Progress");
  });
});

describe("Voice plan item sanitization", () => {
  it("keeps a well-formed event as-is", () => {
    const { items, droppedCount } = sanitizeParsedPlanItems([
      {
        type: "event",
        title: "Team call",
        date: "2026-07-20",
        start_time: "10:00",
        end_time: "10:30",
        time_is_approximate: false,
        category: "Work",
        priority: "medium",
      },
    ]);

    expect(droppedCount).toBe(0);
    expect(items).toEqual([
      {
        type: "event",
        title: "Team call",
        date: "2026-07-20",
        start_time: "10:00",
        end_time: "10:30",
        time_is_approximate: false,
        category: "Work",
        priority: "medium",
      },
    ]);
  });

  it("keeps a well-formed task and forces its time fields to null", () => {
    const { items } = sanitizeParsedPlanItems([
      {
        type: "task",
        title: "Buy groceries",
        date: "2026-07-20",
        start_time: "09:00", // model should never send this for a task, but verify it's stripped anyway
        end_time: "09:30",
        time_is_approximate: false,
        category: "Other",
        priority: "low",
      },
    ]);

    expect(items).toEqual([
      {
        type: "task",
        title: "Buy groceries",
        date: "2026-07-20",
        start_time: null,
        end_time: null,
        time_is_approximate: false,
        category: "Other",
        priority: "low",
      },
    ]);
  });

  it("downgrades an event with no resolvable start time to a task instead of dropping it", () => {
    const { items, droppedCount } = sanitizeParsedPlanItems([
      {
        type: "event",
        title: "Mystery block",
        date: "2026-07-20",
        start_time: null,
        end_time: null,
        time_is_approximate: false,
        category: "Work",
        priority: "medium",
      },
    ]);

    expect(droppedCount).toBe(0);
    expect(items).toHaveLength(1);
    expect(items[0].type).toBe("task");
    expect(items[0].title).toBe("Mystery block");
  });

  it("drops end_time when it isn't actually after start_time", () => {
    const { items } = sanitizeParsedPlanItems([
      {
        type: "event",
        title: "Backwards event",
        date: "2026-07-20",
        start_time: "15:00",
        end_time: "14:00",
        time_is_approximate: false,
        category: "Work",
        priority: "medium",
      },
    ]);

    expect(items[0].start_time).toBe("15:00");
    expect(items[0].end_time).toBeNull();
  });

  it("drops items with an invalid calendar date or missing title", () => {
    const { items, droppedCount } = sanitizeParsedPlanItems([
      {
        type: "task",
        title: "Impossible date",
        date: "2026-02-31",
        start_time: null,
        end_time: null,
        time_is_approximate: false,
        category: "Other",
        priority: "medium",
      },
      {
        type: "task",
        title: "",
        date: "2026-07-20",
        start_time: null,
        end_time: null,
        time_is_approximate: false,
        category: "Other",
        priority: "medium",
      },
    ]);

    expect(items).toHaveLength(0);
    expect(droppedCount).toBe(2);
  });

  it("returns an empty result for non-array input instead of throwing", () => {
    expect(sanitizeParsedPlanItems(null)).toEqual({
      items: [],
      droppedCount: 0,
    });
    expect(sanitizeParsedPlanItems(undefined)).toEqual({
      items: [],
      droppedCount: 0,
    });
    expect(sanitizeParsedPlanItems("not an array")).toEqual({
      items: [],
      droppedCount: 0,
    });
  });
});

function buildPlanItem(
  overrides: Partial<ParsedPlanItem>
): ParsedPlanItem {
  return {
    type: "event",
    title: "Untitled",
    date: "2026-07-18",
    start_time: "10:00",
    end_time: null,
    time_is_approximate: false,
    category: "Other",
    priority: "medium",
    ...overrides,
  };
}

describe("Voice plan conflict detection", () => {
  it("flags the real new-vs-new overlap found in the part 2 checkpoint (landing page work ending 12:30 vs. lunch starting 12:00)", () => {
    const landingPageWork = buildPlanItem({
      title: "Work on landing page",
      start_time: "10:30",
      end_time: "12:30",
    });

    const lunchMeeting = buildPlanItem({
      title: "Lunch meeting with client",
      start_time: "12:00",
      end_time: null, // no stated end -> assumed duration applies
    });

    const result = detectConflicts(
      [landingPageWork, lunchMeeting],
      []
    );

    const [landingResult, lunchResult] = result;

    expect(landingResult.conflicts).toEqual([
      {
        kind: "new_item",
        title: "Lunch meeting with client",
        date: "2026-07-18",
        start_time: "12:00",
        end_time: null,
      },
    ]);

    expect(lunchResult.conflicts).toEqual([
      {
        kind: "new_item",
        title: "Work on landing page",
        date: "2026-07-18",
        start_time: "10:30",
        end_time: "12:30",
      },
    ]);
  });

  it("flags a new item overlapping a real existing calendar event", () => {
    const newEvent = buildPlanItem({
      title: "Team sync",
      start_time: "10:00",
      end_time: "11:00",
    });

    const result = detectConflicts(
      [newEvent],
      [
        {
          title: "Dentist appointment",
          event_date: "2026-07-18",
          start_time: "10:30",
          end_time: "11:15",
        },
      ]
    );

    expect(result[0].conflicts).toEqual([
      {
        kind: "existing_event",
        title: "Dentist appointment",
        date: "2026-07-18",
        start_time: "10:30",
        end_time: "11:15",
      },
    ]);
  });

  it("does not flag events that are clearly separated in time", () => {
    const morningCall = buildPlanItem({
      title: "Morning call",
      start_time: "09:00",
      end_time: "09:30",
    });

    const afternoonWork = buildPlanItem({
      title: "Afternoon work block",
      start_time: "14:00",
      end_time: "16:00",
    });

    const result = detectConflicts([morningCall, afternoonWork], []);

    expect(result[0].conflicts).toEqual([]);
    expect(result[1].conflicts).toEqual([]);
  });

  it("never flags tasks, since they carry no time", () => {
    const task = buildPlanItem({
      type: "task",
      title: "Buy groceries",
      start_time: null,
      end_time: null,
    });

    const overlappingEvent = buildPlanItem({
      title: "Something at the same nominal time",
      start_time: "10:00",
      end_time: "11:00",
    });

    const result = detectConflicts([task, overlappingEvent], []);

    expect(result[0].conflicts).toEqual([]);
  });

  it("applies the default assumed duration when comparing two events with no end_time", () => {
    // Both start at 10:00 with no stated end — under the assumed
    // 30-minute default they occupy the same slot and must conflict.
    const first = buildPlanItem({
      title: "First call",
      start_time: "10:00",
      end_time: null,
    });

    const second = buildPlanItem({
      title: "Second call",
      start_time: "10:15",
      end_time: null,
    });

    const result = detectConflicts([first, second], []);

    expect(result[0].conflicts).toHaveLength(1);
    expect(result[1].conflicts).toHaveLength(1);
  });

  it("does not flag same-time items on different dates", () => {
    const today = buildPlanItem({
      title: "Today's call",
      date: "2026-07-18",
      start_time: "10:00",
      end_time: "11:00",
    });

    const tomorrow = buildPlanItem({
      title: "Tomorrow's call",
      date: "2026-07-19",
      start_time: "10:00",
      end_time: "11:00",
    });

    const result = detectConflicts([today, tomorrow], []);

    expect(result[0].conflicts).toEqual([]);
    expect(result[1].conflicts).toEqual([]);
  });
});

describe("doTimeRangesOverlap", () => {
  it("treats touching intervals (end === start) as non-overlapping", () => {
    expect(doTimeRangesOverlap("10:00", "11:00", "11:00", "12:00")).toBe(
      false
    );
  });

  it("detects a partial overlap", () => {
    expect(doTimeRangesOverlap("10:00", "12:00", "11:00", "13:00")).toBe(
      true
    );
  });

  it("detects one interval fully containing another", () => {
    expect(doTimeRangesOverlap("09:00", "17:00", "12:00", "13:00")).toBe(
      true
    );
  });
});

describe("buildLinkedContextNote", () => {
  const task: TaskRecord = {
    id: "task-1",
    title: "Landing page",
    completed: false,
    priority: "medium",
    due_date: null,
    created_at: "2026-07-01T00:00:00.000Z",
  };

  const goal: GoalRecord = {
    id: "goal-1",
    title: "Launch Orenios",
    description: null,
    progress: 20,
    status: "In Progress",
    deadline: null,
    created_at: "2026-07-01T00:00:00.000Z",
  };

  it("returns null when no task or goal matches", () => {
    expect(buildLinkedContextNote("Gym", [task], [goal])).toBeNull();
  });

  it("links to a matching task only", () => {
    expect(
      buildLinkedContextNote("Work on landing page", [task], [])
    ).toBe("Related to task: Landing page");
  });

  it("links to a matching goal only", () => {
    expect(buildLinkedContextNote("Launch Orenios", [], [goal])).toBe(
      "Related to goal: Launch Orenios"
    );
  });

  it("joins both a task and a goal match into one note", () => {
    const multiMatchTask: TaskRecord = {
      ...task,
      title: "Launch Orenios",
    };

    expect(
      buildLinkedContextNote("Launch Orenios", [multiMatchTask], [goal])
    ).toBe("Related to task: Launch Orenios · Related to goal: Launch Orenios");
  });
});

describe("Voice plan confirm — partial failure and retry safety", () => {
  // A minimal supabase mock covering exactly the calls confirmPlanItems
  // makes: insert+select+single for "tasks"/"calendar_events", and a
  // bare insert for "ai_messages". insertCalls records every row
  // actually written, keyed by table, so tests can assert not just the
  // returned counts but that no extra insert happened for items that
  // should have been skipped as duplicates.
  function buildConfirmSupabaseMock(options: {
    failTaskTitles?: string[];
    failEventTitles?: string[];
  } = {}) {
    const insertCalls: { table: string; title?: string }[] = [];
    const failTaskTitles = new Set(options.failTaskTitles ?? []);
    const failEventTitles = new Set(options.failEventTitles ?? []);

    const supabase = {
      from: (table: string) => {
        if (table === "tasks") {
          return {
            insert: (payload: { title: string; priority: string; due_date: string | null }) => {
              insertCalls.push({ table, title: payload.title });

              return {
                select: () => ({
                  single: async () => {
                    if (failTaskTitles.has(payload.title)) {
                      return { data: null, error: new Error("simulated task insert failure") };
                    }

                    return {
                      data: {
                        id: `task-${payload.title}`,
                        title: payload.title,
                        completed: false,
                        priority: payload.priority,
                        due_date: payload.due_date,
                        created_at: new Date().toISOString(),
                      },
                      error: null,
                    };
                  },
                }),
              };
            },
          };
        }

        if (table === "calendar_events") {
          return {
            insert: (payload: {
              title: string;
              description: string | null;
              event_date: string;
              start_time: string | null;
              end_time: string | null;
              category: string;
            }) => {
              insertCalls.push({ table, title: payload.title });

              return {
                select: () => ({
                  single: async () => {
                    if (failEventTitles.has(payload.title)) {
                      return { data: null, error: new Error("simulated event insert failure") };
                    }

                    return {
                      data: {
                        id: `event-${payload.title}`,
                        title: payload.title,
                        description: payload.description,
                        event_date: payload.event_date,
                        start_time: payload.start_time,
                        end_time: payload.end_time,
                        category: payload.category,
                        created_at: new Date().toISOString(),
                      },
                      error: null,
                    };
                  },
                }),
              };
            },
          };
        }

        if (table === "ai_messages") {
          return {
            insert: async () => ({ data: null, error: null }),
          };
        }

        throw new Error(`Unexpected table in confirm mock: ${table}`);
      },
    };

    return {
      supabase: supabase as never,
      getInsertCallsForTable: (table: string) =>
        insertCalls.filter((call) => call.table === table),
    };
  }

  function buildPlanTask(title: string): ParsedPlanItem {
    return {
      type: "task",
      title,
      date: "2026-07-20",
      start_time: null,
      end_time: null,
      time_is_approximate: false,
      category: "Other",
      priority: "medium",
    };
  }

  it("saves every item when all inserts succeed", async () => {
    const { supabase, getInsertCallsForTable } = buildConfirmSupabaseMock();

    const items = [
      buildPlanTask("Buy groceries"),
      buildPlanTask("Book dentist"),
      buildPlanTask("Call the bank"),
    ];

    const result = await confirmPlanItems({
      items,
      supabase,
      userId: "test-user",
      existingTasks: [],
      existingGoals: [],
      existingEvents: [],
    });

    expect(result.created).toHaveLength(3);
    expect(result.created.map((item) => item.title)).toEqual([
      "Buy groceries",
      "Book dentist",
      "Call the bank",
    ]);
    expect(result.skippedCount).toBe(0);
    expect(result.failedCount).toBe(0);
    expect(result.failedTitles).toEqual([]);
    expect(getInsertCallsForTable("tasks")).toHaveLength(3);
  });

  it("keeps earlier successes and continues past a failure in the middle of the batch", async () => {
    const { supabase, getInsertCallsForTable } = buildConfirmSupabaseMock({
      failTaskTitles: ["Book dentist"],
    });

    const items = [
      buildPlanTask("Buy groceries"),
      buildPlanTask("Book dentist"),
      buildPlanTask("Call the bank"),
    ];

    const result = await confirmPlanItems({
      items,
      supabase,
      userId: "test-user",
      existingTasks: [],
      existingGoals: [],
      existingEvents: [],
    });

    // The two good items on either side of the failing one must both
    // be reported as created — a mid-batch failure must not abort the
    // items that come after it, and must not roll back the ones that
    // already succeeded before it.
    expect(result.created.map((item) => item.title)).toEqual([
      "Buy groceries",
      "Call the bank",
    ]);
    expect(result.failedCount).toBe(1);
    expect(result.failedTitles).toEqual(["Book dentist"]);
    expect(result.skippedCount).toBe(0);

    // All three were genuinely attempted (the failure is a DB error,
    // not a skip), so the mock should show three real insert calls.
    expect(getInsertCallsForTable("tasks")).toHaveLength(3);
  });

  it("does not duplicate already-saved items when the full original batch is retried", async () => {
    // First pass: middle item fails, the other two succeed.
    const firstPass = buildConfirmSupabaseMock({
      failTaskTitles: ["Book dentist"],
    });

    const items = [
      buildPlanTask("Buy groceries"),
      buildPlanTask("Book dentist"),
      buildPlanTask("Call the bank"),
    ];

    const firstResult = await confirmPlanItems({
      items,
      supabase: firstPass.supabase,
      userId: "test-user",
      existingTasks: [],
      existingGoals: [],
      existingEvents: [],
    });

    expect(firstResult.created.map((item) => item.title)).toEqual([
      "Buy groceries",
      "Call the bank",
    ]);
    expect(firstResult.failedTitles).toEqual(["Book dentist"]);

    // Second pass simulates a retry that resends the WHOLE original
    // batch (not just the failed item) — this is the exact scenario
    // that would duplicate rows if duplicate detection didn't run
    // against a fresh read of the caller's tables. "Book dentist" now
    // succeeds; the other two are already in existingTasks, standing
    // in for what a real fresh Supabase read would return after the
    // first pass's successful inserts.
    const secondPass = buildConfirmSupabaseMock();

    const existingTasksAfterFirstPass: TaskRecord[] = [
      {
        id: "task-1",
        title: "Buy groceries",
        completed: false,
        priority: "medium",
        due_date: "2026-07-20",
        created_at: new Date().toISOString(),
      },
      {
        id: "task-2",
        title: "Call the bank",
        completed: false,
        priority: "medium",
        due_date: "2026-07-20",
        created_at: new Date().toISOString(),
      },
    ];

    const secondResult = await confirmPlanItems({
      items, // the full original 3-item batch, resent as-is
      supabase: secondPass.supabase,
      userId: "test-user",
      existingTasks: existingTasksAfterFirstPass,
      existingGoals: [],
      existingEvents: [],
    });

    // Only the previously-failed item should actually be created.
    expect(secondResult.created.map((item) => item.title)).toEqual([
      "Book dentist",
    ]);
    expect(secondResult.skippedCount).toBe(2);
    expect(secondResult.failedCount).toBe(0);

    // The decisive check: the mock must show exactly ONE real insert
    // call on the retry — "Buy groceries" and "Call the bank" must
    // never reach the database a second time.
    const secondPassInserts = secondPass.getInsertCallsForTable("tasks");
    expect(secondPassInserts).toHaveLength(1);
    expect(secondPassInserts[0].title).toBe("Book dentist");
  });

  it("only re-attempts the failed items when the client sends the reduced retry list", async () => {
    // Matches the actual client behavior after the VoicePlanPreview fix:
    // on partial failure, the client filters its local item list down
    // to just the failed titles before the user can retry, so a real
    // retry request only ever contains "Book dentist".
    const { supabase, getInsertCallsForTable } = buildConfirmSupabaseMock();

    const retryItems = [buildPlanTask("Book dentist")];

    const existingTasksAfterFirstPass: TaskRecord[] = [
      {
        id: "task-1",
        title: "Buy groceries",
        completed: false,
        priority: "medium",
        due_date: "2026-07-20",
        created_at: new Date().toISOString(),
      },
      {
        id: "task-2",
        title: "Call the bank",
        completed: false,
        priority: "medium",
        due_date: "2026-07-20",
        created_at: new Date().toISOString(),
      },
    ];

    const result = await confirmPlanItems({
      items: retryItems,
      supabase,
      userId: "test-user",
      existingTasks: existingTasksAfterFirstPass,
      existingGoals: [],
      existingEvents: [],
    });

    expect(result.created.map((item) => item.title)).toEqual([
      "Book dentist",
    ]);
    expect(result.skippedCount).toBe(0);
    expect(getInsertCallsForTable("tasks")).toHaveLength(1);
  });
});
