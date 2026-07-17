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

export type VoicePlanResponse =
  | {
      status: "ok";
      transcript: string;
      items: ParsedPlanItem[];
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
