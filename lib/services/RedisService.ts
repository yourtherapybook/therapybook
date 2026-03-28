import { Redis } from 'ioredis';

// Use a singleton pattern to prevent connection exhaustion in serverless Vercel environments
const globalForRedis = global as unknown as {
    redis: Redis | undefined;
};

// Next.js Edge-compatible instantiation optimized for Upstash bounds
export const redis =
    globalForRedis.redis ??
    new Redis(process.env.KV_URL || 'redis://localhost:6379', {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        retryStrategy(times) {
            const delay = Math.min(times * 50, 2000);
            return delay;
        }
    });

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

export class RedisService {
    /**
     * Safe access to the ioredis instance optimized for Upstash bounds.
     */
    static getClient() {
        return redis;
    }
}
