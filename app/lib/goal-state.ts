export type GoalStatus =
  | "Not Started"
  | "In Progress"
  | "Completed";

export function getGoalStatusForProgress(
  progress: number
): GoalStatus {
  if (progress <= 0) {
    return "Not Started";
  }

  if (progress >= 100) {
    return "Completed";
  }

  return "In Progress";
}

export function normalizeGoalState({
  status,
  progress,
}: {
  status: GoalStatus;
  progress: number;
}) {
  const normalizedProgress = Math.min(
    100,
    Math.max(0, Math.round(progress))
  );

  if (status === "Completed") {
    return {
      status,
      progress: 100,
    };
  }

  if (status === "Not Started") {
    return {
      status,
      progress: 0,
    };
  }

  return {
    status,
    progress: Math.min(99, Math.max(1, normalizedProgress)),
  };
}
