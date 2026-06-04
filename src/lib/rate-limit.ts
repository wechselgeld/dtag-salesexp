import {
    redis,
    ensureRedisConnected,
} from './redis';
import {
    cacheLogger,
} from './logger';
import {
    randomUUID,
} from 'node:crypto';

export interface RateLimitOptions {
    // Window size in milliseconds
    windowMs: number;
    // Maximum number of requests allowed in the window
    max: number;
    // Prefix for the Redis keys, e.g., 'rate_limit:pin_login'
    keyPrefix: string;
}

export class RedisRateLimiter {
    private windowMs: number;
    private max: number;
    private keyPrefix: string;

    constructor(options: RateLimitOptions) {
        this.windowMs = options.windowMs;
        this.max = options.max;
        this.keyPrefix = options.keyPrefix;
    }

    /**
     * Checks if the rate limit is exceeded for a given identifier (e.g. IP or email).
     * Returns an object indicating success, current count, and how many requests are remaining.
     * 
     * This is robust and fail-safe: if Redis is offline or throws an error, the error is caught,
     * logged, and we allow the request (fail-safe) to avoid locking out users because of infrastructure downtime.
     */
    async limit(identifier: string): Promise<{
        success: boolean;
        limit: number;
        remaining: number;
        resetMs: number;
    }> {
        const key = `${this.keyPrefix}:${identifier}`;
        const now = Date.now();
        const clearBefore = now - this.windowMs;
        const windowSeconds = Math.ceil(this.windowMs / 1000);
        const memberId = `${now}:${randomUUID()}`;

        try {
            await ensureRedisConnected();
            // Execute Redis pipeline for atomicity and high performance
            const pipeline = redis.pipeline();
            pipeline.zremrangebyscore(key, '-inf', clearBefore);
            pipeline.zadd(key, now, memberId);
            pipeline.zcard(key);
            pipeline.expire(key, windowSeconds);

            const results = await pipeline.exec();
            if (!results) {
                throw new Error('Pipeline returned null results');
            }

            // Check if any command in the pipeline failed
            for (const result of results) {
                if (result && result[0]) {
                    throw result[0];
                }
            }

            const zcardResult = results[2];
            const count = (zcardResult ? (zcardResult[1] as number) : 1) || 1;
            const success = count <= this.max;
            const remaining = Math.max(0, this.max - count);
            const resetMs = this.windowMs;

            return {
                success,
                limit: this.max,
                remaining,
                resetMs,
            };
        }
        catch (error) {
            const errMsg = error instanceof Error ? error.message : String(error);
            // Fail-safe fallback: log the error but do not block the user
            cacheLogger.error(`Rate limiting error for key ${key}: ${errMsg}. Falling back to fail-safe (allow).`);
            return {
                success: true,
                limit: this.max,
                remaining: this.max,
                resetMs: this.windowMs,
            };
        }
    }
}
