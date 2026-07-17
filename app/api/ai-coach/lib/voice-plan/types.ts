import type { EventCategory, TaskPriority } from "../types";

export type PlanItemType = "event" | "task";

export type ParsedPlanItem = {
  type: PlanItemType;
  title: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  time_is_approximate: boolean;
  // Only meaningful when type === "event"; ignored by the client when
  // type === "task". Always populated (defaulted) rather than nullable
  // to keep the shape uniform if the user later toggles an item's type
  // in the preview UI.
  category: EventCategory;
  // Only meaningful when type === "task"; ignored when type === "event".
  priority: TaskPriority;
};

// Describes one thing a parsed event overlaps with — either a real
// existing calendar_events row, or another item from the same parsed
// batch. "new_item" conflicts are symmetric: if item A overlaps item
// B, both A's and B's conflict lists reference each other.
export type PlanItemConflict = {
  kind: "existing_event" | "new_item";
  title: string;
  date: string;
  start_time: string;
  end_time: string | null;
};

export type PlanItemWithConflicts = ParsedPlanItem & {
  conflicts: PlanItemConflict[];
};

export type VoicePlanResponse =
  | {
      status: "ok";
      transcript: string;
      items: PlanItemWithConflicts[];
    }
  | {
      status: "empty_transcript";
      transcript: string;
    }
  | {
      status: "no_items_found";
      transcript: string;
    }
  | {
      status: "error";
      error: string;
    };
