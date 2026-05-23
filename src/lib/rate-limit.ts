import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "60 s"),
  analytics: true,
  prefix: "coverphoto",
});

export async function checkRateLimit(identifier: string) {
  try {
    const { success, limit, remaining, reset } = await ratelimit.limit(identifier);
    return { success, limit, remaining, reset };
  } catch {
    // Fail open if Redis is unavailable
    return { success: true, limit: 10, remaining: 10, reset: 0 };
  }
}
