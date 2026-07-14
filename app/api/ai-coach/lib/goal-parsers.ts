import { isValidDateKey } from "./dates";

import type {
  CompleteGoalArguments,
  CreateGoalArguments,
  DeleteGoalArguments,
  GoalStatus,
  UpdateGoalArguments,
} from "./types";

function validateGoalTitle(
  value: unknown,
  missingMessage: string
) {
  const title =
    typeof value === "string" ? value.trim() : "";

  if (!title) {
    throw new Error(missingMessage);
  }

  if (title.length > 140) {
    throw new Error(
      "The goal title cannot be longer than 140 characters."
    );
  }

  return title;
}

function parseOptionalDescription(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const description = value.trim();

  if (!description) {
    return null;
  }

  if (description.length > 300) {
    throw new Error(
      "The goal description cannot be longer than 300 characters."
    );
  }

  return description;
}

function parseOptionalDate(
  value: unknown,
  errorMessage: string
) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const date = value.trim();

  if (!isValidDateKey(date)) {
    throw new Error(errorMessage);
  }

  return date;
}

export function parseCreateGoalArguments(
  rawArguments: string
): CreateGoalArguments {
  const parsed = JSON.parse(
    rawArguments
  ) as Partial<CreateGoalArguments>;

  return {
    title: validateGoalTitle(
      parsed.title,
      "The goal title is missing."
    ),
    description: parseOptionalDescription(
      parsed.description
    ),
    deadline: parseOptionalDate(
      parsed.deadline,
      "The goal deadline must use a valid YYYY-MM-DD date."
    ),
  };
}

export function parseCompleteGoalArguments(
  rawArguments: string
): CompleteGoalArguments {
  const parsed = JSON.parse(
    rawArguments
  ) as Partial<CompleteGoalArguments>;

  return {
    title: validateGoalTitle(
      parsed.title,
      "Please specify which goal should be completed."
    ),
  };
}

export function parseDeleteGoalArguments(
  rawArguments: string
): DeleteGoalArguments {
  const parsed = JSON.parse(
    rawArguments
  ) as Partial<DeleteGoalArguments>;

  return {
    title: validateGoalTitle(
      parsed.title,
      "Please specify which goal should be deleted."
    ),
  };
}

export function parseUpdateGoalArguments(
  rawArguments: string
): UpdateGoalArguments {
  const parsed = JSON.parse(
    rawArguments
  ) as Partial<UpdateGoalArguments>;

  const title = validateGoalTitle(
    parsed.title,
    "Please specify which goal should be updated."
  );

  const newTitle =
    typeof parsed.new_title === "string" &&
    parsed.new_title.trim()
      ? validateGoalTitle(
          parsed.new_title,
          "The new goal title is missing."
        )
      : null;

  const description = parseOptionalDescription(
    parsed.description
  );

  const removeDescription =
    parsed.remove_description === true;

  let progress: number | null = null;

  if (typeof parsed.progress === "number") {
    if (
      !Number.isFinite(parsed.progress) ||
      parsed.progress < 0 ||
      parsed.progress > 100
    ) {
      throw new Error(
        "Goal progress must be between 0 and 100."
      );
    }

    progress = Math.round(parsed.progress);
  }

  const validStatuses: GoalStatus[] = [
    "Not Started",
    "In Progress",
    "Completed",
  ];

  const status = validStatuses.includes(
    parsed.status as GoalStatus
  )
    ? (parsed.status as GoalStatus)
    : null;

  const deadline = parseOptionalDate(
    parsed.deadline,
    "The goal deadline must use a valid YYYY-MM-DD date."
  );

  const removeDeadline =
    parsed.remove_deadline === true;

  if (description && removeDescription) {
    throw new Error(
      "The goal description cannot be changed and removed at the same time."
    );
  }

  if (deadline && removeDeadline) {
    throw new Error(
      "The goal deadline cannot be changed and removed at the same time."
    );
  }

  if (
    status === "Completed" &&
    progress !== null &&
    progress !== 100
  ) {
    throw new Error(
      "A completed goal must have 100 percent progress."
    );
  }

  if (
    status === "Not Started" &&
    progress !== null &&
    progress !== 0
  ) {
    throw new Error(
      "A goal that has not started must have 0 percent progress."
    );
  }

  if (
    status === "In Progress" &&
    progress !== null &&
    (progress === 0 || progress === 100)
  ) {
    throw new Error(
      "An in-progress goal must have progress between 1 and 99 percent."
    );
  }

  if (
    !newTitle &&
    !description &&
    !removeDescription &&
    progress === null &&
    !status &&
    !deadline &&
    !removeDeadline
  ) {
    throw new Error("No goal changes were requested.");
  }

  return {
    title,
    new_title: newTitle,
    description,
    remove_description: removeDescription,
    progress,
    status,
    deadline,
    remove_deadline: removeDeadline,
  };
}