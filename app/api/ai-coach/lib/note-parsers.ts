import type { CreateNoteArguments } from "./types";

function validateNoteTitle(value: unknown) {
  const title = typeof value === "string" ? value.trim() : "";

  if (!title) {
    throw new Error("The note title is missing.");
  }

  if (title.length > 140) {
    throw new Error(
      "The note title cannot be longer than 140 characters."
    );
  }

  return title;
}

function parseOptionalContent(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const content = value.trim();

  if (!content) {
    return null;
  }

  if (content.length > 4000) {
    throw new Error(
      "The note content cannot be longer than 4000 characters."
    );
  }

  return content;
}

export function parseCreateNoteArguments(
  rawArguments: string
): CreateNoteArguments {
  const parsed = JSON.parse(
    rawArguments
  ) as Partial<CreateNoteArguments>;

  return {
    title: validateNoteTitle(parsed.title),
    content: parseOptionalContent(parsed.content),
  };
}
