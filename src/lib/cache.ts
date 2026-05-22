import pc from 'picocolors';
import {
  redis,
} from './redis';
import {
  cacheLogger,
} from './logger';

const MISSING = Symbol('MISSING');

// In-process registry of in-flight fetcher Promises, keyed by cache key.
// Prevents thundering-herd: if 500 concurrent requests all miss the same key,
// only one DB query fires. All others await the same Promise.
const inflight = new Map<string, Promise<unknown>>();

export async function getCache<T>(key: string): Promise<T | typeof MISSING> {
  try {
    const cached = await redis.get(key);
    if (cached !== null) return JSON.parse(cached) as T;
  }
  catch (error) {
    // redis.on('error') handles socket-level errors. This catches command-level
    // failures (serialization, wrong type, etc.) that the event handler misses.
    cacheLogger.error(`Cache GET failed for "${key}": ${(error as Error).message}`);
  }
  return MISSING;
}

export async function setCache<T>(key: string, value: T, ttlMs: number): Promise<void> {
  try {
    if (value !== undefined) {
      await redis.set(key, JSON.stringify(value), 'PX', ttlMs);
    }
  }
  catch (error) {
    // Catches OOM, type mismatch, serialization failures — all silently dropped
    // before this fix and invisible to operators.
    cacheLogger.error(`Cache SET failed for "${key}": ${(error as Error).message}`);
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
    cacheLogger.success(`${pc.bold(pc.green('HIT'))} ${pc.dim(key)} ${pc.gray(`(${Date.now() - start}ms)`)}`);
    return cached;
  }

  // Coalesce: reuse an existing in-flight promise rather than spawning a second DB query.
  if (inflight.has(key)) {
    return inflight.get(key) as Promise<T>;
  }

  const promise = fetcher().finally(() => inflight.delete(key));
  inflight.set(key, promise);

  const value = await promise;
  const totalDuration = Date.now() - start;
  cacheLogger.info(`${pc.bold(pc.yellow('MISS'))} ${pc.dim(key)} ${pc.gray(`(Total: ${totalDuration}ms)`)}`);

  // Fire-and-forget: don't block the response on the cache write.
  setCache(key, value, ttlMs);

  return value;
}

// Scans keys with the SCAN cursor instead of KEYS *.
// KEYS is O(N) and blocks Redis's single thread for the entire scan duration.
// SCAN is O(1) per call and yields control between iterations.
async function scanKeys(pattern: string): Promise<string[]> {
  const keys: string[] = [
  ];
  let cursor = '0';
  do {
    const [
      nextCursor,
      batch,
    ] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
    keys.push(...batch);
    cursor = nextCursor;
  } while (cursor !== '0');
  return keys;
}

export async function invalidateCache(keyPrefix: string): Promise<void> {
  const start = Date.now();
  try {
    const keys = await scanKeys(`${keyPrefix}*`);
    if (keys.length === 0) return;

    const batchSize = 100;
    for (let i = 0; i < keys.length; i += batchSize) {
      const chunk = keys.slice(i, i + batchSize);
      await redis.del(...chunk);
    }

    cacheLogger.info(
      `${pc.bold(pc.magenta('INVALIDATE'))} ${pc.dim(keyPrefix)}* ${pc.gray(`(${keys.length} keys, ${Date.now() - start}ms)`)}`,
    );
  }
  catch (err) {
    cacheLogger.error(`Cache invalidation failed for "${keyPrefix}*": ${(err as Error).message}`);
  }
}
