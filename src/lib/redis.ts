import {
 Redis,
} from 'ioredis';
import pc from 'picocolors';
import {
 cacheLogger,
} from './logger';

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const createRedisInstance = () => {
  const instance = new Redis(redisUrl, {
    maxRetriesPerRequest: 1, // Fail fast in dev
    connectTimeout: 2000,
    enableOfflineQueue: false,
    retryStrategy(times) {
      if (times > 3) {
        return null;
      }
      return Math.min(times * 200, 1000);
    },
  });

  // Log connection status events to DEBUG level so they don't spam the console
  // but stay available if someone explicitly enables debug logs.
  instance.on('connect', () => {
    cacheLogger.debug(pc.green('Connection established to Dragonfly/Redis'));
  });

  instance.on('error', (err) => {
    cacheLogger.error(pc.red(`Redis Connection Error: ${err.message}`));
  });

  instance.on('ready', () => {
    cacheLogger.debug(pc.cyan('Redis Ready and accepting commands'));
  });

  return instance;
};

export const redis = globalForRedis.redis ?? createRedisInstance();

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}
