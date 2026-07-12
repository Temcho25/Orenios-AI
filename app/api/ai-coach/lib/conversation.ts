import type { StoredAIMessage } from "./types";

export function formatConversationHistory(
  messages: StoredAIMessage[]
) {
  if (messages.length === 0) {
    return "No previous conversation.";
  }

  return messages
    .map((message) => {
      const speaker =
        message.role === "user"
          ? "USER"
          : "ORENIOS AI";

      return `${speaker}:\n${message.content}`;
    })
    .join("\n\n");
}