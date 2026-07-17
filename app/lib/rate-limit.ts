import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

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

// Stricter than the text AI Coach limit: a voice-plan request costs a
// transcription call plus a larger structured-output completion, so
// it's meaningfully more expensive per call than a short text turn.
export const voicePlanRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  analytics: true,
  prefix: "orenios:voice-plan",
});
