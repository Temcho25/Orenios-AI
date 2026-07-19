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

// A minimal, read-only snapshot of the user's existing events on the
// dates involved — sent alongside the parsed items so the preview UI
// can recompute conflicts locally as the user edits a row, without a
// round trip to the server on every keystroke.
export type ExistingEventSnapshot = {
  title: string;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
};

export type VoicePlanResponse =
  | {
      status: "ok";
      transcript: string;
      items: PlanItemWithConflicts[];
      existingEvents: ExistingEventSnapshot[];
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

export type ConfirmedItemResult = {
  title: string;
  type: PlanItemType;
  status: "created" | "skipped_duplicate";
};

export type VoicePlanConfirmResponse =
  | {
      status: "ok";
      created: ConfirmedItemResult[];
      skippedCount: number;
      failedCount: number;
      failedTitles: string[];
    }
  | {
      status: "error";
      error: string;
    };
