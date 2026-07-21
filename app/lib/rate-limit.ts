import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { PlanTier } from "./paddle-plans";

const redis = Redis.fromEnv();

export const waitlistRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10 m"),
  analytics: true,
  prefix: "orenios:waitlist",
});

export const aiCoachRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(15, "1 m"),
  analytics: true,
  prefix: "orenios:ai-coach",
});

// PLACEHOLDER NUMBERS — not a business decision I can make. Tune these
// (and the "no active subscription" default) to whatever the real
// per-tier quotas should be; nothing else needs to change to adjust
// them. "pro" has no entry on purpose — Pro has no daily cap, only the
// per-minute abuse limiter above applies.
export const AI_COACH_DAILY_QUOTA: Partial<Record<PlanTier, number>> = {
  early: 30,
  basic: 100,
};

// Applied to signed-in users with no active paid subscription (never
// subscribed, or status is paused/canceled).
export const AI_COACH_NO_PLAN_DAILY_QUOTA = 10;

const aiCoachDailyLimiters = new Map<string, Ratelimit>();

// One Ratelimit instance per tier (Upstash's limiter config is fixed at
// construction time), created lazily and cached — mirrors the eager
// instances above but keyed dynamically since the tier isn't known
// until the caller looks up the user's subscription.
export function getAiCoachDailyLimit(tier: PlanTier | null): Ratelimit | null {
  const dailyMax = tier ? AI_COACH_DAILY_QUOTA[tier] : AI_COACH_NO_PLAN_DAILY_QUOTA;

  if (dailyMax === undefined) {
    // No entry for this tier (currently just "pro") means uncapped.
    return null;
  }

  const key = tier ?? "no-plan";
  const existing = aiCoachDailyLimiters.get(key);

  if (existing) {
    return existing;
  }

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(dailyMax, "1 d"),
    analytics: true,
    prefix: `orenios:ai-coach-quota:${key}`,
  });

  aiCoachDailyLimiters.set(key, limiter);
  return limiter;
}

// Stricter than the text AI Coach limit: a voice-plan request costs a
// transcription call plus a larger structured-output completion, so
// it's meaningfully more expensive per call than a short text turn.
export const voicePlanRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  analytics: true,
  prefix: "orenios:voice-plan",
});
