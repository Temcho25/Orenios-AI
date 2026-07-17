import { findBestTaskMatch } from "../task-matcher";
import { findBestGoalMatch } from "../goal-matcher";

import type { GoalRecord, TaskRecord } from "../types";

// Soft, textual linking only, per the architecture plan: calendar_events
// has a free-text description field to append a note into; tasks has
// no description column at all in this schema, so this only ever
// applies when inserting an event. No schema change, no foreign key —
// a confident fuzzy title match against the user's existing tasks or
// goals becomes one extra line of context text, nothing more.
export function buildLinkedContextNote(
  title: string,
  tasks: TaskRecord[],
  goals: GoalRecord[]
): string | null {
  const notes: string[] = [];

  const taskMatch = findBestTaskMatch(tasks, title);

  if (taskMatch.status === "found") {
    notes.push(`Related to task: ${taskMatch.task.title}`);
  }

  const goalMatch = findBestGoalMatch(goals, title);

  if (goalMatch.status === "found") {
    notes.push(`Related to goal: ${goalMatch.goal.title}`);
  }

  return notes.length > 0 ? notes.join(" · ") : null;
}
