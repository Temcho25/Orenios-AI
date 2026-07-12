export type StoredAIMessage = {
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

export type TaskPriority = "low" | "medium" | "high";

export type CreateTaskArguments = {
  title: string;
  priority: TaskPriority;
  due_date: string | null;
};

export type CompleteTaskArguments = {
  title: string;
};

export type DeleteTaskArguments = {
  title: string;
};

export type UpdateTaskArguments = {
  title: string;
  new_title: string | null;
  priority: TaskPriority | null;
  due_date: string | null;
  remove_due_date: boolean;
};

export type TaskRecord = {
  id: string;
  title: string;
  completed: boolean;
  priority: TaskPriority;
  due_date: string | null;
  created_at: string;
};