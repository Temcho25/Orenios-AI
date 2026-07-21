import type { SupabaseClient } from "@supabase/supabase-js";
import type { PlanTier } from "./paddle-plans";

// active/trialing/past_due keep access (Paddle still shows the sub as
// current — past_due just means a payment retry is in progress, per
// the paddle-agent-skills subscription-sync guide's status table).
// paused/canceled are the only statuses that lose access.
const ACCESS_GRANTING_STATUSES = new Set(["active", "trialing", "past_due"]);

export type SubscriptionInfo = {
  planTier: PlanTier;
  status: string;
  hasAccess: boolean;
};

// A user can have more than one row over time (canceling and later
// resubscribing creates a new Paddle subscription ID rather than
// reusing the old one) — the most recently updated row is always the
// current one.
export async function getSubscription(
  supabase: SupabaseClient,
  userId: string
): Promise<SubscriptionInfo | null> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("plan_tier, status")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    planTier: data.plan_tier as PlanTier,
    status: data.status as string,
    hasAccess: ACCESS_GRANTING_STATUSES.has(data.status as string),
  };
}
