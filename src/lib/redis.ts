import { Redis } from 'ioredis';
import pc from 'picocolors';
import { cacheLogger } from './logger';

const globalForRedis = globalThis as unknown as { redis: Redis | undefined };

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const createRedisInstance = () => {
  const instance = new Redis(redisUrl, {
    // Don't throw at import time if Redis isn't up yet — commands will queue
    // until the connection is established or fail fast individually.
    lazyConnect: true,
    connectTimeout: 5000,
    // Offline queue disabled: a command issued while disconnected fails
    // immediately rather than silently accumulating. Callers (cache.ts) handle
    // the error and fall through to the DB, which is the correct behavior.
    enableOfflineQueue: false,
    // Backoff with jitter, capped at 30s. Never returns null — ioredis interprets
    // null as "stop retrying forever", which turns a 5-second Redis restart into
    // a full application outage until the Node process is manually killed.
    retryStrategy(times) {
      const base = Math.min(100 * Math.pow(2, times), 30_000);
      return base + Math.floor(Math.random() * 200);
    },
  });

  instance.on('connect', () => cacheLogger.debug(pc.green('Redis connected')));
  instance.on('ready', () => cacheLogger.debug(pc.cyan('Redis ready')));
  instance.on('error', (err) => cacheLogger.error(pc.red(`Redis error: ${err.message}`)));
  instance.on('reconnecting', (ms: number) => cacheLogger.debug(`Redis reconnecting in ${ms}ms`));

  return instance;
};

export const redis = globalForRedis.redis ?? createRedisInstance();

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}
