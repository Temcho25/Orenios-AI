export function formatCreatedGoalReply(goal: {
  title: string;
  deadline: string | null;
}) {
  const deadlineText = goal.deadline
    ? ` Deadline: ${goal.deadline}.`
    : " No deadline was added.";

  return `\u2705 Goal created: "${goal.title}".${deadlineText}`;
}