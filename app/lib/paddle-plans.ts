export type PlanTier = "early" | "basic" | "pro";

export const PLAN_TIERS: PlanTier[] = ["early", "basic", "pro"];

// price_id -> plan_tier, driven entirely by env vars so no code change is
// needed when real Paddle Sandbox/production price IDs are created —
// only the env var values change. Shared between the client checkout
// trigger (needs the price IDs to open Checkout) and the webhook handler
// (needs to map an incoming price_id back to a plan_tier).
export const PLAN_PRICE_IDS: Record<PlanTier, string | undefined> = {
  early: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_EARLY,
  basic: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_BASIC,
  pro: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_PRO,
};

export function planTierFromPriceId(priceId: string): PlanTier | null {
  for (const tier of PLAN_TIERS) {
    if (PLAN_PRICE_IDS[tier] === priceId) {
      return tier;
    }
  }

  return null;
}

export const PLAN_DETAILS: Record<
  PlanTier,
  { name: string; priceLabel: string }
> = {
  early: { name: "Early Access", priceLabel: "$2.99/mo" },
  basic: { name: "Basic", priceLabel: "$4.99/mo" },
  pro: { name: "Pro", priceLabel: "$9.99/mo" },
};
