import type { TaskPriority } from "./types";

export function formatCreatedTaskReply(task: {
  title: string;
  priority: TaskPriority;
  due_date: string | null;
}) {
  const deadlineText = task.due_date
    ? ` Deadline: ${task.due_date}.`
    : " No deadline was added.";

  return `✅ Task created: "${task.title}". Priority: ${task.priority}.${deadlineText}`;
}