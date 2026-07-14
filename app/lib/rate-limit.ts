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
