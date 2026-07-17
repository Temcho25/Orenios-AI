import type { SetDailyFocusArguments } from "./types";

function validateFocusTitle(value: unknown) {
  const title = typeof value === "string" ? value.trim() : "";

  if (!title) {
    throw new Error("The focus title is missing.");
  }

  if (title.length > 140) {
    throw new Error(
      "Today's focus title cannot be longer than 140 characters."
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
      "Today's focus description cannot be longer than 300 characters."
    );
  }

  return description;
}

export function parseSetDailyFocusArguments(
  rawArguments: string
): SetDailyFocusArguments {
  const parsed = JSON.parse(
    rawArguments
  ) as Partial<SetDailyFocusArguments>;

  return {
    title: validateFocusTitle(parsed.title),
    description: parseOptionalDescription(parsed.description),
  };
}
