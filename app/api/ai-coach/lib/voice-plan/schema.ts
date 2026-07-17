// Strict Structured Outputs schema for the Responses API. Deliberately
// kept to type/enum constraints only — deeper semantic validation
// (real calendar dates, HH:MM format, start-before-end, length caps)
// happens in parse-response.ts, matching how the rest of this codebase
// validates model output (task/goal/event-parsers.ts) rather than
// leaning on JSON Schema to carry that weight.
export const voicePlanJsonSchema = {
  type: "object",
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["event", "task"],
            description:
              "event: happens at a specific point in time. task: an open-ended to-do with no specific clock time.",
          },
          title: {
            type: "string",
            description:
              "A concise title for this item, without filler phrases like 'add' or 'schedule'.",
          },
          date: {
            type: "string",
            description:
              "YYYY-MM-DD. Always resolve relative dates (today, tomorrow, a weekday name) yourself using current_date.",
          },
          start_time: {
            type: ["string", "null"],
            description:
              "24-hour HH:MM. Required when type is event. Always null when type is task.",
          },
          end_time: {
            type: ["string", "null"],
            description:
              "24-hour HH:MM. Null when type is task, or when type is event and no end time or duration was stated.",
          },
          time_is_approximate: {
            type: "boolean",
            description:
              "True when start_time was inferred from a vague time-of-day phrase (morning, lunch, evening) rather than an exact clock time the speaker stated.",
          },
          category: {
            type: "string",
            enum: ["Personal", "Work", "Health", "Fitness", "Other"],
            description:
              "Best-fit category when type is event. Use Other when type is task or the category is unclear.",
          },
          priority: {
            type: "string",
            enum: ["low", "medium", "high"],
            description:
              "Best-fit priority when type is task. Use medium when type is event or priority is unclear.",
          },
        },
        required: [
          "type",
          "title",
          "date",
          "start_time",
          "end_time",
          "time_is_approximate",
          "category",
          "priority",
        ],
        additionalProperties: false,
      },
    },
  },
  required: ["items"],
  additionalProperties: false,
} as const;
