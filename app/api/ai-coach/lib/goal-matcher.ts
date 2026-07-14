import type { GoalRecord } from "./types";

export function normalizeGoalTitle(value: string) {
  return value
    .trim()
    .toLocaleLowerCase()
    .replace(/[â€œâ€"'`]/g, "")
    .replace(/\s+/g, " ");
}

export function findBestGoalMatch(
  goals: GoalRecord[],
  requestedTitle: string
) {
  const normalizedRequestedTitle =
    normalizeGoalTitle(requestedTitle);

  const exactMatches = goals.filter(
    (goal) =>
      normalizeGoalTitle(goal.title) ===
      normalizedRequestedTitle
  );

  if (exactMatches.length === 1) {
    return {
      status: "found" as const,
      goal: exactMatches[0],
    };
  }

  if (exactMatches.length > 1) {
    return {
      status: "ambiguous" as const,
      goals: exactMatches,
    };
  }

  const partialMatches = goals.filter((goal) => {
    const normalizedGoalTitle =
      normalizeGoalTitle(goal.title);

    return (
      normalizedGoalTitle.includes(
        normalizedRequestedTitle
      ) ||
      normalizedRequestedTitle.includes(
        normalizedGoalTitle
      )
    );
  });

  if (partialMatches.length === 1) {
    return {
      status: "found" as const,
      goal: partialMatches[0],
    };
  }

  if (partialMatches.length > 1) {
    return {
      status: "ambiguous" as const,
      goals: partialMatches,
    };
  }

  return {
    status: "not_found" as const,
  };
}

export function formatAmbiguousGoalReply(
  goals: GoalRecord[],
  actionText: string
) {
  const matchingTitles = goals
    .slice(0, 5)
    .map((goal) => `"${goal.title}"`)
    .join(", ");

  return `I found multiple possible goals: ${matchingTitles}. Please tell me which one you want to ${actionText}.`;
}