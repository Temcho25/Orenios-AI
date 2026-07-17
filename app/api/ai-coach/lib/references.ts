import { findBestGoalMatch } from "./goal-matcher";
import { findBestTaskMatch } from "./task-matcher";

import type {
  GoalRecord,
  StoredAIMessage,
  TaskRecord,
} from "./types";

type WorkspaceReference = {
  kind: "task" | "goal" | "event";
  title: string;
};

type ReferencedAction = {
  functionName: string;
  rawArguments: string;
};

function isNaturalReferenceFollowUp(message: string) {
  return /\b(it|that|this)\b/i.test(message);
}

function extractReference(
  content: string
): WorkspaceReference | null {
  const patterns: Array<{
    kind: WorkspaceReference["kind"];
    pattern: RegExp;
  }> = [
    {
      kind: "task",
      pattern:
        /Task (?:created|completed|deleted): "([^"]+)"/i,
    },
    {
      kind: "task",
      pattern:
        /Task updated:.*renamed to "([^"]+)"/i,
    },
    {
      kind: "goal",
      pattern:
        /Goal (?:created|completed|deleted): "([^"]+)"/i,
    },
    {
      kind: "goal",
      pattern:
        /Goal updated:.*renamed to "([^"]+)"/i,
    },
    {
      kind: "event",
      pattern:
        /Event (?:created|deleted): "([^"]+)"/i,
    },
    {
      kind: "event",
      pattern:
        /Event updated:.*renamed to "([^"]+)"/i,
    },
  ];

  for (const { kind, pattern } of patterns) {
    const match = content.match(pattern);

    if (match?.[1]?.trim()) {
      return {
        kind,
        title: match[1].trim(),
      };
    }
  }

  return null;
}

function findRecentWorkspaceReference(
  messages: StoredAIMessage[]
) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];

    if (message.role !== "assistant") {
      continue;
    }

    const reference = extractReference(message.content);

    if (reference) {
      return reference;
    }
  }

  return null;
}

export function resolveReferencedAction({
  message,
  previousMessages,
  functionName,
  rawArguments,
}: {
  message: string;
  previousMessages: StoredAIMessage[];
  functionName: string;
  rawArguments: string;
}): ReferencedAction {
  if (!isNaturalReferenceFollowUp(message)) {
    return {
      functionName,
      rawArguments,
    };
  }

  const actionMatch = functionName.match(
    /^(complete|delete|update)_(task|goal|event)$/
  );

  if (!actionMatch) {
    return {
      functionName,
      rawArguments,
    };
  }

  const reference = findRecentWorkspaceReference(
    previousMessages
  );

  if (!reference) {
    return {
      functionName,
      rawArguments,
    };
  }

  // There is no complete_event action — events don't have a completed
  // state the way tasks and goals do. If the most recently discussed
  // item was an event but the model guessed a "complete" verb, leave
  // the original call alone rather than rewriting it to a tool that
  // doesn't exist.
  if (actionMatch[1] === "complete" && reference.kind === "event") {
    return {
      functionName,
      rawArguments,
    };
  }

  try {
    const parsedArguments = JSON.parse(
      rawArguments
    ) as Record<string, unknown>;

    return {
      functionName: `${actionMatch[1]}_${reference.kind}`,
      rawArguments: JSON.stringify({
        ...parsedArguments,
        title: reference.title,
      }),
    };
  } catch {
    return {
      functionName,
      rawArguments,
    };
  }
}

export function getCrossTypeAmbiguityReply({
  message,
  functionName,
  rawArguments,
  tasks,
  goals,
}: {
  message: string;
  functionName: string;
  rawArguments: string;
  tasks: TaskRecord[];
  goals: GoalRecord[];
}) {
  const actionMatch = functionName.match(
    /^(complete|delete|update)_(task|goal)$/
  );

  if (!actionMatch) {
    return null;
  }

  const selectedKind = actionMatch[2] as
    | "task"
    | "goal";

  const mentionsTask = /\btasks?\b/i.test(message);
  const mentionsGoal = /\bgoals?\b/i.test(message);

  if (
    selectedKind === "task" &&
    mentionsTask &&
    !mentionsGoal
  ) {
    return null;
  }

  if (
    selectedKind === "goal" &&
    mentionsGoal &&
    !mentionsTask
  ) {
    return null;
  }

  try {
    const parsedArguments = JSON.parse(
      rawArguments
    ) as Record<string, unknown>;

    const title =
      typeof parsedArguments.title === "string"
        ? parsedArguments.title.trim()
        : "";

    if (!title) {
      return null;
    }

    const taskMatch = findBestTaskMatch(tasks, title);
    const goalMatch = findBestGoalMatch(goals, title);

    if (
      taskMatch.status === "not_found" ||
      goalMatch.status === "not_found"
    ) {
      return null;
    }

    const actionQuestion =
      actionMatch[1] === "complete"
        ? "mark the task or the goal as completed"
        : `${actionMatch[1]} the task or the goal`;

    return `I found both a task and a goal matching "${title}". Please tell me whether you want to ${actionQuestion}.`;
  } catch {
    return null;
  }
}