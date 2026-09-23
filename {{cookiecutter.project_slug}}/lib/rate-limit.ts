import { getRedis } from "@/lib/redis";

interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number; // seconds until window resets
}

/**
 * Sliding window rate limiter using Redis INCR + EXPIRE.
 * @param key - Unique key for this rate limit (e.g., "job:userId")
 * @param limit - Max requests allowed in the window
 * @param windowSec - Window duration in seconds
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSec: number
): Promise<RateLimitResult> {
  const redis = getRedis();
  const fullKey = `rl:${key}`;

  const multi = redis.multi();
  multi.incr(fullKey);
  multi.ttl(fullKey);
  const results = await multi.exec();

  const count = (results?.[0]?.[1] as number) ?? 1;
  const ttl = (results?.[1]?.[1] as number) ?? -1;

  // Set expiry on first request in window
  if (ttl === -1) {
    await redis.expire(fullKey, windowSec);
  }

  return {
    success: count <= limit,
    remaining: Math.max(0, limit - count),
    reset: ttl === -1 ? windowSec : ttl,
  };
}

/**
 * Helper to check rate limit and return a 429 Response if exceeded.
 * For use in API routes.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSec: number
): Promise<Response | null> {
  const result = await rateLimit(key, limit, windowSec);
  if (!result.success) {
    return new Response(
      JSON.stringify({
        error: "Too many requests. Please try again later.",
        retryAfter: result.reset,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(result.reset),
        },
      }
    );
  }
  return null;
}

/**
 * Helper for server actions — throws if rate limited.
 */
export async function enforceRateLimit(
  key: string,
  limit: number,
  windowSec: number
): Promise<void> {
  const result = await rateLimit(key, limit, windowSec);
  if (!result.success) {
    throw new Error("Too many requests. Please try again later.");
  }
}
