export const EVENT_CATEGORIES = [
  "Personal",
  "Work",
  "Health",
  "Fitness",
  "Other",
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];
