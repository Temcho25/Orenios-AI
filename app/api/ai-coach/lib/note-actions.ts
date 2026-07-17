import { createClient } from "../../../lib/supabase-server";

import { normalizeTitle } from "./task-matcher";
import { parseCreateNoteArguments } from "./note-parsers";

import type { NoteRecord } from "./types";

type SupabaseClient = Awaited<
  ReturnType<typeof createClient>
>;

type ExecuteNoteActionArguments = {
  functionName: string;
  rawArguments: string;
  supabase: SupabaseClient;
  userId: string;
  notes: NoteRecord[];
};

type NoteActionResult = {
  handled: boolean;
  reply: string;
  action: string | null;
};

const noteSelect = "id, title, content, created_at, updated_at";

export async function executeNoteAction({
  functionName,
  rawArguments,
  supabase,
  userId,
  notes,
}: ExecuteNoteActionArguments): Promise<NoteActionResult> {
  if (functionName !== "create_note") {
    return {
      handled: false,
      reply: "",
      action: null,
    };
  }

  const noteArguments = parseCreateNoteArguments(rawArguments);

  const duplicateNote = notes.find(
    (note) =>
      normalizeTitle(note.title) ===
      normalizeTitle(noteArguments.title)
  );

  if (duplicateNote) {
    return {
      handled: true,
      action: "create_note",
      reply: `You already have a note titled "${duplicateNote.title}". Would you like to create another one with the same title or update the existing note?`,
    };
  }

  const now = new Date().toISOString();

  const { data: createdNote, error: createNoteError } =
    await supabase
      .from("notes")
      .insert({
        user_id: userId,
        title: noteArguments.title,
        content: noteArguments.content,
        updated_at: now,
      })
      .select(noteSelect)
      .single();

  if (createNoteError || !createdNote) {
    console.error(
      "Could not create AI note:",
      createNoteError
    );

    throw new Error(
      "Orenios understood the request but could not create the note."
    );
  }

  return {
    handled: true,
    action: "create_note",
    reply: `✅ Note created: "${createdNote.title}".`,
  };
}
