import { createClient } from "../../../lib/supabase-server";

import {
  findBestGoalMatch,
  formatAmbiguousGoalReply,
  normalizeGoalTitle,
} from "./goal-matcher";

import {
  parseCompleteGoalArguments,
  parseCreateGoalArguments,
  parseDeleteGoalArguments,
  parseUpdateGoalArguments,
} from "./goal-parsers";

import { formatCreatedGoalReply } from "./goal-replies";

import type {
  GoalRecord,
  GoalStatus,
} from "./types";

type SupabaseClient = Awaited<
  ReturnType<typeof createClient>
>;

type ExecuteGoalActionArguments = {
  functionName: string;
  rawArguments: string;
  supabase: SupabaseClient;
  userId: string;
  goals: GoalRecord[];
};

type GoalActionResult = {
  handled: boolean;
  reply: string;
  action: string | null;
};

const goalSelect =
  "id, title, description, progress, status, deadline, created_at";

export async function executeGoalAction({
  functionName,
  rawArguments,
  supabase,
  userId,
  goals,
}: ExecuteGoalActionArguments): Promise<GoalActionResult> {
  if (functionName === "create_goal") {
    const goalArguments =
      parseCreateGoalArguments(rawArguments);

    const duplicateGoal = goals.find(
      (goal) =>
        goal.status !== "Completed" &&
        normalizeGoalTitle(goal.title) ===
          normalizeGoalTitle(goalArguments.title)
    );

    if (duplicateGoal) {
      return {
        handled: true,
        action: "create_goal",
        reply: `That goal already exists in your active goals: "${duplicateGoal.title}".`,
      };
    }

    const {
      data: createdGoal,
      error: createGoalError,
    } = await supabase
      .from("goals")
      .insert({
        user_id: userId,
        title: goalArguments.title,
        description: goalArguments.description,
        progress: 0,
        status: "Not Started",
        deadline: goalArguments.deadline,
      })
      .select(goalSelect)
      .single();

    if (createGoalError || !createdGoal) {
      console.error(
        "Could not create AI goal:",
        createGoalError
      );

      throw new Error(
        "Orenios understood the request but could not create the goal."
      );
    }

    return {
      handled: true,
      action: "create_goal",
      reply: formatCreatedGoalReply({
        title: createdGoal.title,
        deadline: createdGoal.deadline,
      }),
    };
  }

  if (functionName === "complete_goal") {
    const goalArguments =
      parseCompleteGoalArguments(rawArguments);

    const activeGoals = goals.filter(
      (goal) => goal.status !== "Completed"
    );

    const match = findBestGoalMatch(
      activeGoals,
      goalArguments.title
    );

    if (match.status === "not_found") {
      const completedMatch = findBestGoalMatch(
        goals.filter(
          (goal) => goal.status === "Completed"
        ),
        goalArguments.title
      );

      return {
        handled: true,
        action: "complete_goal",
        reply:
          completedMatch.status === "found"
            ? `The goal "${completedMatch.goal.title}" is already completed.`
            : `I couldn’t find an active goal matching "${goalArguments.title}".`,
      };
    }

    if (match.status === "ambiguous") {
      return {
        handled: true,
        action: "complete_goal",
        reply: formatAmbiguousGoalReply(
          match.goals,
          "mark as completed"
        ),
      };
    }

    const {
      data: completedGoal,
      error: completeGoalError,
    } = await supabase
      .from("goals")
      .update({
        progress: 100,
        status: "Completed",
      })
      .eq("id", match.goal.id)
      .eq("user_id", userId)
      .neq("status", "Completed")
      .select(goalSelect)
      .single();

    if (completeGoalError || !completedGoal) {
      console.error(
        "Could not complete AI goal:",
        completeGoalError
      );

      throw new Error(
        "Orenios found the goal but could not mark it as completed."
      );
    }

    return {
      handled: true,
      action: "complete_goal",
      reply: `✅ Goal completed: "${completedGoal.title}".`,
    };
  }

  if (functionName === "delete_goal") {
    const goalArguments =
      parseDeleteGoalArguments(rawArguments);

    const match = findBestGoalMatch(
      goals,
      goalArguments.title
    );

    if (match.status === "not_found") {
      return {
        handled: true,
        action: "delete_goal",
        reply: `I couldn’t find a goal matching "${goalArguments.title}".`,
      };
    }

    if (match.status === "ambiguous") {
      return {
        handled: true,
        action: "delete_goal",
        reply: formatAmbiguousGoalReply(
          match.goals,
          "delete"
        ),
      };
    }

    const {
      data: deletedGoal,
      error: deleteGoalError,
    } = await supabase
      .from("goals")
      .delete()
      .eq("id", match.goal.id)
      .eq("user_id", userId)
      .select(goalSelect)
      .single();

    if (deleteGoalError || !deletedGoal) {
      console.error(
        "Could not delete AI goal:",
        deleteGoalError
      );

      throw new Error(
        "Orenios found the goal but could not delete it."
      );
    }

    return {
      handled: true,
      action: "delete_goal",
      reply: `✅ Goal deleted: "${deletedGoal.title}".`,
    };
  }

  if (functionName === "update_goal") {
    const goalArguments =
      parseUpdateGoalArguments(rawArguments);

    const match = findBestGoalMatch(
      goals,
      goalArguments.title
    );

    if (match.status === "not_found") {
      return {
        handled: true,
        action: "update_goal",
        reply: `I couldn’t find a goal matching "${goalArguments.title}".`,
      };
    }

    if (match.status === "ambiguous") {
      return {
        handled: true,
        action: "update_goal",
        reply: formatAmbiguousGoalReply(
          match.goals,
          "update"
        ),
      };
    }

    const updates: {
      title?: string;
      description?: string | null;
      progress?: number;
      status?: GoalStatus;
      deadline?: string | null;
    } = {};

    if (goalArguments.new_title) {
      const duplicateTitle = goals.find(
        (goal) =>
          goal.id !== match.goal.id &&
          goal.status !== "Completed" &&
          normalizeGoalTitle(goal.title) ===
            normalizeGoalTitle(
              goalArguments.new_title!
            )
      );

      if (duplicateTitle) {
        return {
          handled: true,
          action: "update_goal",
          reply: `An active goal already exists with the title "${duplicateTitle.title}".`,
        };
      }

      updates.title = goalArguments.new_title;
    }

    if (goalArguments.remove_description) {
      updates.description = null;
    } else if (goalArguments.description) {
      updates.description = goalArguments.description;
    }

    if (goalArguments.progress !== null) {
      updates.progress = goalArguments.progress;

      if (!goalArguments.status) {
        updates.status =
          goalArguments.progress === 0
            ? "Not Started"
            : goalArguments.progress === 100
              ? "Completed"
              : "In Progress";
      }
    }

    if (goalArguments.status) {
      updates.status = goalArguments.status;

      if (
        goalArguments.status === "Completed" &&
        goalArguments.progress === null
      ) {
        updates.progress = 100;
      }

      if (
        goalArguments.status === "Not Started" &&
        goalArguments.progress === null
      ) {
        updates.progress = 0;
      }
    }

    if (goalArguments.remove_deadline) {
      updates.deadline = null;
    } else if (goalArguments.deadline) {
      updates.deadline = goalArguments.deadline;
    }

    const {
      data: updatedGoal,
      error: updateGoalError,
    } = await supabase
      .from("goals")
      .update(updates)
      .eq("id", match.goal.id)
      .eq("user_id", userId)
      .select(goalSelect)
      .single();

    if (updateGoalError || !updatedGoal) {
      console.error(
        "Could not update AI goal:",
        updateGoalError
      );

      throw new Error(
        "Orenios found the goal but could not update it."
      );
    }

    const changes: string[] = [];

    if (goalArguments.new_title) {
      changes.push(
        `renamed to "${updatedGoal.title}"`
      );
    }

    if (goalArguments.remove_description) {
      changes.push("description removed");
    } else if (goalArguments.description) {
      changes.push("description updated");
    }

    if (goalArguments.progress !== null) {
      changes.push(
        `progress changed to ${updatedGoal.progress}%`
      );
    }

    if (goalArguments.status) {
      changes.push(
        `status changed to ${updatedGoal.status}`
      );
    }

    if (goalArguments.remove_deadline) {
      changes.push("deadline removed");
    } else if (goalArguments.deadline) {
      changes.push(
        `deadline changed to ${updatedGoal.deadline}`
      );
    }

    return {
      handled: true,
      action: "update_goal",
      reply: `✅ Goal updated: ${changes.join(", ")}.`,
    };
  }

  return {
    handled: false,
    reply: "",
    action: null,
  };
}