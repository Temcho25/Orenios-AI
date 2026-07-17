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

  {
    type: "function",
    name: "create_goal",
    description:
      "Create a new long-term goal in the authenticated user's Orenios goals. Use only when the newest user message clearly asks to create, add, set or track a goal or outcome.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description:
            "A concise goal title without phrases such as create goal or add goal.",
        },
        description: {
          type: ["string", "null"],
          description:
            "A short description of what success means. Use null when the user did not provide one.",
        },
        deadline: {
          type: ["string", "null"],
          description:
            "Goal deadline in YYYY-MM-DD format. Resolve relative dates using current_date. Use null when no deadline was requested.",
        },
      },
      required: ["title", "description", "deadline"],
      additionalProperties: false,
    },
  },

  {
    type: "function",
    name: "complete_goal",
    description:
      "Mark one existing active goal as completed and set its progress to 100 percent. Use when the newest user message says a goal was achieved, reached, finished or completed.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description:
            "The title or identifying phrase of the existing goal the user achieved.",
        },
      },
      required: ["title"],
      additionalProperties: false,
    },
  },

  {
    type: "function",
    name: "delete_goal",
    description:
      "Permanently delete one existing goal from the authenticated user's Orenios goals. Use only when the newest user message clearly asks to delete, remove or get rid of a goal.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description:
            "The title or identifying phrase of the existing goal the user wants to delete.",
        },
      },
      required: ["title"],
      additionalProperties: false,
    },
  },

  {
    type: "function",
    name: "update_goal",
    description:
      "Update one existing goal. Use when the newest user message asks to rename a goal, change or remove its description, update progress or status, change its deadline, postpone it, or remove its deadline.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description:
            "The current title or identifying phrase of the existing goal.",
        },
        new_title: {
          type: ["string", "null"],
          description:
            "The new goal title. Use null when the title should not change.",
        },
        description: {
          type: ["string", "null"],
          description:
            "The new goal description. Use null when the description should not change.",
        },
        remove_description: {
          type: "boolean",
          description:
            "Use true only when the user explicitly asks to remove or clear the goal description.",
        },
        progress: {
          type: ["number", "null"],
          minimum: 0,
          maximum: 100,
          description:
            "The new goal progress from 0 to 100. Use null when progress should not change.",
        },
        status: {
          type: ["string", "null"],
          enum: [
            "Not Started",
            "In Progress",
            "Completed",
            null,
          ],
          description:
            "The new goal status. Use null when status should not change.",
        },
        deadline: {
          type: ["string", "null"],
          description:
            "The new goal deadline in YYYY-MM-DD format. Resolve relative dates using current_date. Use null when the deadline should not change.",
        },
        remove_deadline: {
          type: "boolean",
          description:
            "Use true only when the user explicitly asks to remove or clear the goal deadline.",
        },
      },
      required: [
        "title",
        "new_title",
        "description",
        "remove_description",
        "progress",
        "status",
        "deadline",
        "remove_deadline",
      ],
      additionalProperties: false,
    },
  },

  {
    type: "function",
    name: "create_event",
    description:
      "Create a new calendar event in the authenticated user's Orenios calendar. Use when the newest user message clearly asks to schedule, book, add to the calendar, or put a specific-time or specific-date happening (meeting, call, appointment, reminder, note on a date) on the calendar, as opposed to an open-ended to-do.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description:
            "A concise event title without phrases such as add event or schedule. When the user only asks for a generic reminder or note on a date without describing what it is, use a short generic title such as Reminder or Note instead of asking what to call it.",
        },
        description: {
          type: ["string", "null"],
          description:
            "A short optional description. Use null when the user did not provide one.",
        },
        event_date: {
          type: "string",
          description:
            "The event date in YYYY-MM-DD format. Always resolve relative dates (today, tomorrow, a weekday name, next week, in N days/weeks/months) yourself using current_date. Never leave this to the user to clarify when a relative date was given.",
        },
        start_time: {
          type: ["string", "null"],
          description:
            "Start time in 24-hour HH:MM format. Use null when no specific time was requested.",
        },
        end_time: {
          type: ["string", "null"],
          description:
            "End time in 24-hour HH:MM format. Use null when no end time or duration was requested. Requires start_time to also be set.",
        },
        category: {
          type: "string",
          enum: ["Personal", "Work", "Health", "Fitness", "Other"],
          description:
            "Best-fit category for the event. Use Other when it does not clearly fit another category.",
        },
      },
      required: [
        "title",
        "description",
        "event_date",
        "start_time",
        "end_time",
        "category",
      ],
      additionalProperties: false,
    },
  },

  {
    type: "function",
    name: "delete_event",
    description:
      "Permanently delete one existing calendar event. Use only when the newest user message clearly asks to delete, remove or cancel a calendar event.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description:
            "The title or identifying phrase of the existing event the user wants to delete.",
        },
        event_date: {
          type: ["string", "null"],
          description:
            "The event's YYYY-MM-DD date, only if the user mentioned it to identify which event they mean. Use null otherwise.",
        },
      },
      required: ["title", "event_date"],
      additionalProperties: false,
    },
  },

  {
    type: "function",
    name: "update_event",
    description:
      "Update one existing calendar event. Use when the newest user message asks to reschedule, move, rename, retime or change the category of an existing event.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description:
            "The current title or identifying phrase of the existing event.",
        },
        event_date: {
          type: ["string", "null"],
          description:
            "The event's current YYYY-MM-DD date, only if needed to identify which event among same-titled ones. Use null otherwise.",
        },
        new_title: {
          type: ["string", "null"],
          description:
            "The new event title. Use null when the title should not change.",
        },
        new_event_date: {
          type: ["string", "null"],
          description:
            "The new YYYY-MM-DD date if the event is being moved to a different day. Resolve relative dates using current_date. Use null when the date should not change.",
        },
        start_time: {
          type: ["string", "null"],
          description:
            "The new start time in 24-hour HH:MM format. Use null when the start time should not change.",
        },
        end_time: {
          type: ["string", "null"],
          description:
            "The new end time in 24-hour HH:MM format. Use null when the end time should not change.",
        },
        remove_end_time: {
          type: "boolean",
          description:
            "Use true only when the user explicitly asks to remove the event's end time.",
        },
        category: {
          type: ["string", "null"],
          enum: ["Personal", "Work", "Health", "Fitness", "Other", null],
          description:
            "The new category. Use null when the category should not change.",
        },
      },
      required: [
        "title",
        "event_date",
        "new_title",
        "new_event_date",
        "start_time",
        "end_time",
        "remove_end_time",
        "category",
      ],
      additionalProperties: false,
    },
  },

  {
    type: "function",
    name: "create_note",
    description:
      "Create a new free-form note in the authenticated user's Orenios notes. Use only when the newest user message clearly asks to write down, save or make a note of something, with no date or time attached — see the disambiguation guide above.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description:
            "A concise note title without phrases such as add note or make a note.",
        },
        content: {
          type: ["string", "null"],
          description:
            "The body of the note. Use null when the user gave only a title-like phrase and nothing more to write down.",
        },
      },
      required: ["title", "content"],
      additionalProperties: false,
    },
  },

  {
    type: "function",
    name: "set_daily_focus",
    description:
      "Set or replace today's single main objective in the authenticated user's Orenios daily focus. Use only when the newest user message clearly names today's top priority — see the disambiguation guide above.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description:
            "A concise statement of today's main objective.",
        },
        description: {
          type: ["string", "null"],
          description:
            "A short optional note on why it matters. Use null when the user did not provide one.",
        },
      },
      required: ["title", "description"],
      additionalProperties: false,
    },
  },
];