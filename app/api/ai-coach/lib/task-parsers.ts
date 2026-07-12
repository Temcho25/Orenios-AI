import { isValidDateKey } from "./dates";

import type {
  TaskPriority,
  CreateTaskArguments,
  CompleteTaskArguments,
  DeleteTaskArguments,
  UpdateTaskArguments,
} from "./types";

function validateTitle(
  value: unknown,
  missingMessage: string
) {
  const title =
    typeof value === "string" ? value.trim() : "";

  if (!title) {
    throw new Error(missingMessage);
  }

  if (title.length > 120) {
    throw new Error(
      "The task title cannot be longer than 120 characters."
    );
  }

  return title;
}

export function parseCreateTaskArguments(
  rawArguments: string
): CreateTaskArguments {
  const parsed = JSON.parse(
    rawArguments
  ) as Partial<CreateTaskArguments>;

  const title = validateTitle(
    parsed.title,
    "The task title is missing."
  );

  const validPriorities: TaskPriority[] = [
    "low",
    "medium",
    "high",
  ];

  const priority = validPriorities.includes(
    parsed.priority as TaskPriority
  )
    ? (parsed.priority as TaskPriority)
    : "medium";

  let dueDate: string | null = null;

  if (
    typeof parsed.due_date === "string" &&
    parsed.due_date.trim()
  ) {
    const normalizedDate = parsed.due_date.trim();

    if (!isValidDateKey(normalizedDate)) {
      throw new Error(
        "The task deadline must use a valid YYYY-MM-DD date."
      );
    }

    dueDate = normalizedDate;
  }

  return {
    title,
    priority,
    due_date: dueDate,
  };
}

export function parseCompleteTaskArguments(
  rawArguments: string
): CompleteTaskArguments {
  const parsed = JSON.parse(
    rawArguments
  ) as Partial<CompleteTaskArguments>;

  return {
    title: validateTitle(
      parsed.title,
      "Please specify which task should be completed."
    ),
  };
}

export function parseDeleteTaskArguments(
  rawArguments: string
): DeleteTaskArguments {
  const parsed = JSON.parse(
    rawArguments
  ) as Partial<DeleteTaskArguments>;

  return {
    title: validateTitle(
      parsed.title,
      "Please specify which task should be deleted."
    ),
  };
}

export function parseUpdateTaskArguments(
  rawArguments: string
): UpdateTaskArguments {
  const parsed = JSON.parse(
    rawArguments
  ) as Partial<UpdateTaskArguments>;

  const title = validateTitle(
    parsed.title,
    "Please specify which task should be updated."
  );

  const newTitle =
    typeof parsed.new_title === "string" &&
    parsed.new_title.trim()
      ? validateTitle(
          parsed.new_title,
          "The new task title is missing."
        )
      : null;

  const validPriorities: TaskPriority[] = [
    "low",
    "medium",
    "high",
  ];

  const priority = validPriorities.includes(
    parsed.priority as TaskPriority
  )
    ? (parsed.priority as TaskPriority)
    : null;

  let dueDate: string | null = null;

  if (
    typeof parsed.due_date === "string" &&
    parsed.due_date.trim()
  ) {
    const normalizedDate = parsed.due_date.trim();

    if (!isValidDateKey(normalizedDate)) {
      throw new Error(
        "The task deadline must use a valid YYYY-MM-DD date."
      );
    }

    dueDate = normalizedDate;
  }

  const removeDueDate =
    parsed.remove_due_date === true;

  if (
    !newTitle &&
    !priority &&
    !dueDate &&
    !removeDueDate
  ) {
    throw new Error(
      "No task changes were requested."
    );
  }

  if (dueDate && removeDueDate) {
    throw new Error(
      "The deadline cannot be changed and removed at the same time."
    );
  }

  return {
    title,
    new_title: newTitle,
    priority,
    due_date: dueDate,
    remove_due_date: removeDueDate,
  };
}