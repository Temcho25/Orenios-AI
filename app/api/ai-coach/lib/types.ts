import type { GoalStatus as SharedGoalStatus } from "../../../lib/goal-state";

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

export type GoalStatus = SharedGoalStatus;

export type CreateGoalArguments = {
  title: string;
  description: string | null;
  deadline: string | null;
};

export type CompleteGoalArguments = {
  title: string;
};

export type DeleteGoalArguments = {
  title: string;
};

export type UpdateGoalArguments = {
  title: string;
  new_title: string | null;
  description: string | null;
  remove_description: boolean;
  progress: number | null;
  status: GoalStatus | null;
  deadline: string | null;
  remove_deadline: boolean;
};

export type GoalRecord = {
  id: string;
  title: string;
  description: string | null;
  progress: number;
  status: GoalStatus;
  deadline: string | null;
  created_at: string;
};

export type EventCategory =
  | "Personal"
  | "Work"
  | "Health"
  | "Fitness"
  | "Other";

export type CreateEventArguments = {
  title: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  category: EventCategory;
};

export type EventRecord = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  category: EventCategory;
  created_at: string;
};

export type DeleteEventArguments = {
  title: string;
  event_date: string | null;
};

export type UpdateEventArguments = {
  title: string;
  event_date: string | null;
  new_title: string | null;
  new_event_date: string | null;
  start_time: string | null;
  end_time: string | null;
  remove_end_time: boolean;
  category: EventCategory | null;
};

export type CreateNoteArguments = {
  title: string;
  content: string | null;
};

export type NoteRecord = {
  id: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
};

export type SetDailyFocusArguments = {
  title: string;
  description: string | null;
};

export type DailyFocusRecord = {
  id: string;
  title: string;
  description: string | null;
  progress: number;
  focus_date: string;
};
