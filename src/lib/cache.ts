import pc from 'picocolors';
import { redis } from './redis';
import { cacheLogger } from './logger';

const MISSING = Symbol('MISSING');

export async function getCache<T>(key: string): Promise<T | typeof MISSING> {
  try {
    const cached = await redis.get(key);
    if (cached !== null) {
      return JSON.parse(cached) as T;
    }
  } catch (error) {
    // Error is already logged by redis.on('error') in redis.ts
  }
  return MISSING;
}

export async function setCache<T>(key: string, value: T, ttlMs: number): Promise<void> {
  try {
    if (value !== undefined && value !== null) {
      // Redis expects TTL in milliseconds if using PX
      await redis.set(key, JSON.stringify(value), 'PX', ttlMs);
    }
  } catch (error) {
    // Error is already logged by redis.on('error') in redis.ts
  }
}

export async function getCached<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  const start = Date.now();
  const cached = await getCache<T>(key);
  
  if (cached !== MISSING) {
    const duration = Date.now() - start;
    cacheLogger.success(`${pc.bold(pc.green('HIT'))} ${pc.dim(key)} ${pc.gray(`(${duration}ms)`)}`);
    return cached;
  }

  const value = await fetcher();
  const totalDuration = Date.now() - start;
  
  cacheLogger.info(`${pc.bold(pc.yellow('MISS'))} ${pc.dim(key)} ${pc.gray(`(Total: ${totalDuration}ms)`)}`);
  
  // Fire and forget: do not block the request for the cache write
  setCache(key, value, ttlMs).catch(() => {});
  
  return value;
}

export function invalidateCache(keyPrefix: string): void {
  const start = Date.now();
  // Fire and forget to match the original synchronous API
  redis.keys(`${keyPrefix}*`).then(keys => {
    if (keys.length > 0) {
      redis.del(...keys).then(() => {
        const duration = Date.now() - start;
        cacheLogger.info(`${pc.bold(pc.magenta('INVALIDATE'))} ${pc.dim(keyPrefix)}* ${pc.gray(`(${keys.length} keys, ${duration}ms)`)}`);
      }).catch(err => cacheLogger.error(`Invalidate DEL failed: ${err.message}`));
    }
  }).catch(error => {
    cacheLogger.error(`Invalidate KEYS failed: ${error.message}`);
  });
}
