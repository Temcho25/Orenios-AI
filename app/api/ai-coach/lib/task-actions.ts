import { createClient } from "../../../lib/supabase-server";

import {
  findBestTaskMatch,
  formatAmbiguousTaskReply,
  normalizeTitle,
} from "./task-matcher";

import {
  parseCompleteTaskArguments,
  parseCreateTaskArguments,
  parseDeleteTaskArguments,
  parseUpdateTaskArguments,
} from "./task-parsers";

import { formatCreatedTaskReply } from "./task-replies";

import type {
  TaskPriority,
  TaskRecord,
} from "./types";

type SupabaseClient = Awaited<
  ReturnType<typeof createClient>
>;

type ExecuteTaskActionArguments = {
  functionName: string;
  rawArguments: string;
  supabase: SupabaseClient;
  userId: string;
  tasks: TaskRecord[];
};

type TaskActionResult = {
  handled: boolean;
  reply: string;
  action: string | null;
};

const taskSelect =
  "id, title, completed, priority, due_date, created_at";

// Shared by the create_task action below and by the voice-plan confirm
// endpoint, so there is exactly one place that knows how to insert a
// task row rather than two copies drifting apart.
export async function insertTaskRow(
  supabase: SupabaseClient,
  userId: string,
  fields: {
    title: string;
    priority: TaskPriority;
    due_date: string | null;
  }
): Promise<TaskRecord> {
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      user_id: userId,
      title: fields.title,
      completed: false,
      priority: fields.priority,
      due_date: fields.due_date,
    })
    .select(taskSelect)
    .single();

  if (error || !data) {
    console.error("Could not insert task row:", error);

    throw new Error(
      "Orenios understood the request but could not create the task."
    );
  }

  return data as TaskRecord;
}

export async function executeTaskAction({
  functionName,
  rawArguments,
  supabase,
  userId,
  tasks,
}: ExecuteTaskActionArguments): Promise<TaskActionResult> {
  if (functionName === "create_task") {
    const taskArguments =
      parseCreateTaskArguments(rawArguments);

    const duplicateTask = tasks.find(
      (task) =>
        !task.completed &&
        normalizeTitle(task.title) ===
          normalizeTitle(taskArguments.title)
    );

    if (duplicateTask) {
      return {
        handled: true,
        action: "create_task",
        reply: `That task already exists in your active task list: "${duplicateTask.title}".`,
      };
    }

    const createdTask = await insertTaskRow(supabase, userId, {
      title: taskArguments.title,
      priority: taskArguments.priority,
      due_date: taskArguments.due_date,
    });

    return {
      handled: true,
      action: "create_task",
      reply: formatCreatedTaskReply({
        title: createdTask.title,
        priority:
          createdTask.priority as TaskPriority,
        due_date: createdTask.due_date,
      }),
    };
  }

  if (functionName === "complete_task") {
    const taskArguments =
      parseCompleteTaskArguments(rawArguments);

    const activeTasks = tasks.filter(
      (task) => !task.completed
    );

    const match = findBestTaskMatch(
      activeTasks,
      taskArguments.title
    );

    if (match.status === "not_found") {
      const completedMatch = findBestTaskMatch(
        tasks.filter((task) => task.completed),
        taskArguments.title
      );

      return {
        handled: true,
        action: "complete_task",
        reply:
          completedMatch.status === "found"
            ? `The task "${completedMatch.task.title}" is already completed.`
            : `I couldn’t find an active task matching "${taskArguments.title}".`,
      };
    }

    if (match.status === "ambiguous") {
      return {
        handled: true,
        action: "complete_task",
        reply: formatAmbiguousTaskReply(
          match.tasks,
          "mark as completed"
        ),
      };
    }

    const {
      data: completedTask,
      error: completeTaskError,
    } = await supabase
      .from("tasks")
      .update({
        completed: true,
      })
      .eq("id", match.task.id)
      .eq("user_id", userId)
      .eq("completed", false)
      .select(taskSelect)
      .single();

    if (completeTaskError || !completedTask) {
      console.error(
        "Could not complete AI task:",
        completeTaskError
      );

      throw new Error(
        "Orenios found the task but could not mark it as completed."
      );
    }

    return {
      handled: true,
      action: "complete_task",
      reply: `✅ Task completed: "${completedTask.title}".`,
    };
  }

  if (functionName === "delete_task") {
    const taskArguments =
      parseDeleteTaskArguments(rawArguments);

    const match = findBestTaskMatch(
      tasks,
      taskArguments.title
    );

    if (match.status === "not_found") {
      return {
        handled: true,
        action: "delete_task",
        reply: `I couldn’t find a task matching "${taskArguments.title}".`,
      };
    }

    if (match.status === "ambiguous") {
      return {
        handled: true,
        action: "delete_task",
        reply: formatAmbiguousTaskReply(
          match.tasks,
          "delete"
        ),
      };
    }

    const {
      data: deletedTask,
      error: deleteTaskError,
    } = await supabase
      .from("tasks")
      .delete()
      .eq("id", match.task.id)
      .eq("user_id", userId)
      .select(taskSelect)
      .single();

    if (deleteTaskError || !deletedTask) {
      console.error(
        "Could not delete AI task:",
        deleteTaskError
      );

      throw new Error(
        "Orenios found the task but could not delete it."
      );
    }

    return {
      handled: true,
      action: "delete_task",
      reply: `✅ Task deleted: "${deletedTask.title}".`,
    };
  }

  if (functionName === "update_task") {
    const taskArguments =
      parseUpdateTaskArguments(rawArguments);

    const match = findBestTaskMatch(
      tasks,
      taskArguments.title
    );

    if (match.status === "not_found") {
      return {
        handled: true,
        action: "update_task",
        reply: `I couldn’t find a task matching "${taskArguments.title}".`,
      };
    }

    if (match.status === "ambiguous") {
      return {
        handled: true,
        action: "update_task",
        reply: formatAmbiguousTaskReply(
          match.tasks,
          "update"
        ),
      };
    }

    const updates: {
      title?: string;
      priority?: TaskPriority;
      due_date?: string | null;
    } = {};

    if (taskArguments.new_title) {
      const duplicateTitle = tasks.find(
        (task) =>
          task.id !== match.task.id &&
          !task.completed &&
          normalizeTitle(task.title) ===
            normalizeTitle(taskArguments.new_title!)
      );

      if (duplicateTitle) {
        return {
          handled: true,
          action: "update_task",
          reply: `An active task already exists with the title "${duplicateTitle.title}".`,
        };
      }

      updates.title = taskArguments.new_title;
    }

    if (taskArguments.priority) {
      updates.priority = taskArguments.priority;
    }

    if (taskArguments.remove_due_date) {
      updates.due_date = null;
    } else if (taskArguments.due_date) {
      updates.due_date = taskArguments.due_date;
    }

    const {
      data: updatedTask,
      error: updateTaskError,
    } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", match.task.id)
      .eq("user_id", userId)
      .select(taskSelect)
      .single();

    if (updateTaskError || !updatedTask) {
      console.error(
        "Could not update AI task:",
        updateTaskError
      );

      throw new Error(
        "Orenios found the task but could not update it."
      );
    }

    const changes: string[] = [];

    if (taskArguments.new_title) {
      changes.push(
        `renamed to "${updatedTask.title}"`
      );
    }

    if (taskArguments.priority) {
      changes.push(
        `priority changed to ${updatedTask.priority}`
      );
    }

    if (taskArguments.remove_due_date) {
      changes.push("deadline removed");
    } else if (taskArguments.due_date) {
      changes.push(
        `deadline changed to ${updatedTask.due_date}`
      );
    }

    return {
      handled: true,
      action: "update_task",
      reply: `✅ Task updated: ${changes.join(", ")}.`,
    };
  }

  return {
    handled: false,
    reply: "",
    action: null,
  };
}