import type { GoalStatus } from "../../lib/goal-state";

export function formatDeadline(deadline: string | null) {
  if (!deadline) {
    return "No deadline";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${deadline}T00:00:00`));
}

export function getStatusClasses(status: GoalStatus) {
  if (status === "Completed") {
    return "bg-accent-mint/15 text-accent-mint";
  }

  if (status === "In Progress") {
    return "bg-accent-violet/15 text-accent-violet";
  }

  return "bg-surface-strong text-foreground/50";
}
