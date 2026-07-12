import type OpenAI from "openai";

export const aiCoachTools: OpenAI.Responses.Tool[] = [
  {
    type: "function",
    name: "create_task",
    description:
      "Create a new task in the authenticated user's Orenios task list. Use only when the newest user message clearly asks to add, create, remember, schedule or put a task in their task list.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description:
            "A concise task title without phrases such as add task or create task.",
        },
        priority: {
          type: "string",
          enum: ["low", "medium", "high"],
          description:
            "Task priority. Use medium when the user does not specify or imply one.",
        },
        due_date: {
          type: ["string", "null"],
          description:
            "Deadline in YYYY-MM-DD format. Resolve relative dates using current_date. Use null when no deadline was requested.",
        },
      },
      required: ["title", "priority", "due_date"],
      additionalProperties: false,
    },
  },

  {
    type: "function",
    name: "complete_task",
    description:
      "Mark one existing unfinished task as completed. Use when the newest user message says a task is finished, done, completed or should be marked complete.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description:
            "The title or identifying phrase of the existing task the user wants to complete.",
        },
      },
      required: ["title"],
      additionalProperties: false,
    },
  },

  {
    type: "function",
    name: "delete_task",
    description:
      "Permanently delete one existing task from the authenticated user's Orenios task list. Use only when the newest user message clearly asks to delete, remove or get rid of a task.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description:
            "The title or identifying phrase of the existing task the user wants to delete.",
        },
      },
      required: ["title"],
      additionalProperties: false,
    },
  },

  {
    type: "function",
    name: "update_task",
    description:
      "Update one existing task. Use this when the newest user message asks to rename a task, change its priority, change its deadline, postpone it, move it to another date, or remove its deadline.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description:
            "The current title or identifying phrase of the existing task.",
        },
        new_title: {
          type: ["string", "null"],
          description:
            "The new task title. Use null when the title should not change.",
        },
        priority: {
          type: ["string", "null"],
          enum: ["low", "medium", "high", null],
          description:
            "The new priority. Use null when the priority should not change.",
        },
        due_date: {
          type: ["string", "null"],
          description:
            "The new deadline in YYYY-MM-DD format. Resolve relative dates using current_date. Use null when the deadline should not change.",
        },
        remove_due_date: {
          type: "boolean",
          description:
            "Use true only when the user explicitly asks to remove or clear the task deadline.",
        },
      },
      required: [
        "title",
        "new_title",
        "priority",
        "due_date",
        "remove_due_date",
      ],
      additionalProperties: false,
    },
  },
];