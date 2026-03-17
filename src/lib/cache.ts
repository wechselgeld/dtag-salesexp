interface CacheEntry<T> {
    value: T;
    expiry: number;
}

const cache = new Map<string, CacheEntry<any>>();

const MISSING = Symbol('MISSING');

export function getCache<T>(key: string): T | typeof MISSING {
    const entry = cache.get(key);
    if (!entry) {
        return MISSING;
    }
    if (Date.now() > entry.expiry) {
        cache.delete(key);
        return MISSING;
    }
    return entry.value as T;
}

export function setCache<T>(key: string, value: T, ttlMs: number): void {
    cache.set(key, {
        value,
        expiry: Date.now() + ttlMs,
    });
}

export async function getCached<T>(
    key: string,
    ttlMs: number,
    fetcher: () => Promise<T>,
): Promise<T> {
    const cached = getCache<T>(key);
    if (cached !== MISSING) {
        return cached;
    }

    const value = await fetcher();
    setCache(key, value, ttlMs);
    return value;
}

export function invalidateCache(keyPrefix: string): void {
    for (const key of cache.keys()) {
        if (key.startsWith(keyPrefix)) {
            cache.delete(key);
        }
    }
}
