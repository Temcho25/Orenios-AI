type ActionResult = {
  handled: boolean;
  reply: string;
  action: string | null;
};

function toSafeReply(error: unknown) {
  const message =
    error instanceof Error ? error.message.trim() : "";

  const looksSafe =
    message.length > 0 &&
    message.length <= 300 &&
    !message.includes("\n");

  return looksSafe
    ? message
    : "I couldn't make that change — could you tell me more specifically what you'd like updated?";
}

// Every parser (task/goal/event/note/focus) throws a plain Error for
// invalid or no-op arguments coming back from the model (missing title,
// "no changes requested", a malformed date, and so on). Those messages
// are already written to be shown directly to the user. Without this
// wrapper, a thrown error skips the rest of route.ts's action chain and
// falls all the way to the outer catch, turning a normal "I didn't
// understand what to change" case into an opaque HTTP 500.
export async function runActionSafely(
  label: string,
  action: () => Promise<ActionResult>
): Promise<ActionResult> {
  try {
    return await action();
  } catch (error) {
    console.error(`AI Coach ${label} action failed:`, error);

    return {
      handled: true,
      action: null,
      reply: toSafeReply(error),
    };
  }
}
