import {
  Redis,
} from 'ioredis';
import pc from 'picocolors';
import {
  cacheLogger,
} from './logger';

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
    // KeepAlive (10 seconds) prevents connection dropouts over NATs/firewalls
    keepAlive: 10000,
    // Backoff with jitter, capped at 30s. Never returns null — ioredis interprets
    // null as "stop retrying forever", which turns a 5-second Redis restart into
    // a full application outage until the Node process is manually killed.
    retryStrategy(times) {
      const base = Math.min(100 * Math.pow(2, times), 30_000);
      return base + Math.floor(Math.random() * 200);
    },
  });

  instance.on('connecting', () => cacheLogger.debug(pc.yellow('Redis connecting')));
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

let connectPromise: Promise<void> | null = null;

/**
 * Ensures the Redis connection is fully in the 'ready' state before executing commands.
 * This handles lazyConnect and reconnection race conditions under high concurrency.
 */
export async function ensureRedisConnected(): Promise<Redis> {
  // If already ready, return immediately
  if (redis.status === 'ready') {
    return redis;
  }

  // If we are currently connecting/reconnecting, wait for the active promise
  if (connectPromise) {
    await connectPromise;
    return redis;
  }

  // If in 'wait' state (not yet connecting), start the connection
  if (redis.status === 'wait') {
    connectPromise = redis.connect().catch((err) => {
      cacheLogger.error(`Redis connection failed during connect(): ${err.message}`);
      throw err;
    }).finally(() => {
      connectPromise = null;
    });
    await connectPromise;
    return redis;
  }

  // If in another state (e.g., 'connecting', 'reconnecting', 'connect' but not ready),
  // wait for the 'ready' event or an error
  connectPromise = new Promise<void>((resolve, reject) => {
    const onReady = () => {
      cleanup();
      resolve();
    };
    const onError = (err: Error) => {
      cleanup();
      reject(err);
    };
    const cleanup = () => {
      redis.off('ready', onReady);
      redis.off('error', onError);
    };
    
    redis.on('ready', onReady);
    redis.on('error', onError);

    // Safeguard timeout to prevent hanging the request forever
    setTimeout(() => {
      cleanup();
      reject(new Error('Redis connection handshake timeout (5s)'));
    }, 5000);
  }).finally(() => {
    connectPromise = null;
  });

  await connectPromise;
  return redis;
}

