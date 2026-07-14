import { describe, expect, it } from "vitest";

import { isValidDateKey } from "../app/api/ai-coach/lib/dates";
import { normalizeGoalTitle } from "../app/api/ai-coach/lib/goal-matcher";
import {
  parseCreateGoalArguments,
  parseUpdateGoalArguments,
} from "../app/api/ai-coach/lib/goal-parsers";
import { normalizeTitle } from "../app/api/ai-coach/lib/task-matcher";
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
