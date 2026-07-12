import type { TaskRecord } from "./types";

export function normalizeTitle(value: string) {
  return value
    .trim()
    .toLocaleLowerCase()
    .replace(/[“”"'`]/g, "")
    .replace(/\s+/g, " ");
}

export function findBestTaskMatch(
  tasks: TaskRecord[],
  requestedTitle: string
) {
  const normalizedRequestedTitle =
    normalizeTitle(requestedTitle);

  const exactMatches = tasks.filter(
    (task) =>
      normalizeTitle(task.title) ===
      normalizedRequestedTitle
  );

  if (exactMatches.length === 1) {
    return {
      status: "found" as const,
      task: exactMatches[0],
    };
  }

  if (exactMatches.length > 1) {
    return {
      status: "ambiguous" as const,
      tasks: exactMatches,
    };
  }

  const partialMatches = tasks.filter((task) => {
    const normalizedTaskTitle =
      normalizeTitle(task.title);

    return (
      normalizedTaskTitle.includes(
        normalizedRequestedTitle
      ) ||
      normalizedRequestedTitle.includes(
        normalizedTaskTitle
      )
    );
  });

  if (partialMatches.length === 1) {
    return {
      status: "found" as const,
      task: partialMatches[0],
    };
  }

  if (partialMatches.length > 1) {
    return {
      status: "ambiguous" as const,
      tasks: partialMatches,
    };
  }

  return {
    status: "not_found" as const,
  };
}

export function formatAmbiguousTaskReply(
  tasks: TaskRecord[],
  actionText: string
) {
  const matchingTitles = tasks
    .slice(0, 5)
    .map((task) => `"${task.title}"`)
    .join(", ");

  return `I found multiple possible tasks: ${matchingTitles}. Please tell me which one you want to ${actionText}.`;
}