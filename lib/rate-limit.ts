import { RedisService } from './services/RedisService';

/**
 * Simple sliding-window rate limiter using Redis.
 * Returns true if the request is allowed, false if rate-limited.
 */
export async function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number; retryAfterSeconds: number }> {
  try {
    const redis = RedisService.getClient();
    const redisKey = `ratelimit:${key}`;
    const count = await redis.incr(redisKey);

    if (count === 1) {
      await redis.expire(redisKey, windowSeconds);
    }

    const ttl = await redis.ttl(redisKey);
    const remaining = Math.max(0, maxAttempts - count);

    return {
      allowed: count <= maxAttempts,
      remaining,
      retryAfterSeconds: count > maxAttempts ? Math.max(ttl, 1) : 0,
    };
  } catch {
    // Redis unavailable — fail open (allow request) but log
    console.warn('Rate limiter unavailable (Redis down). Failing open.');
    return { allowed: true, remaining: maxAttempts, retryAfterSeconds: 0 };
  }
}

// Preset limiters
export const loginLimiter = (ip: string) =>
  checkRateLimit(`login:ip:${ip}`, 10, 900); // 10 attempts per 15 min per IP

export const loginAccountLimiter = (email: string) =>
  checkRateLimit(`login:account:${email}`, 5, 900); // 5 per 15 min per account

export const registerLimiter = (ip: string) =>
  checkRateLimit(`register:ip:${ip}`, 5, 3600); // 5 per hour per IP

export const resetLimiter = (ip: string) =>
  checkRateLimit(`reset:ip:${ip}`, 3, 3600); // 3 per hour per IP

export const resendLimiter = (ip: string) =>
  checkRateLimit(`resend:ip:${ip}`, 3, 600); // 3 per 10 min per IP
