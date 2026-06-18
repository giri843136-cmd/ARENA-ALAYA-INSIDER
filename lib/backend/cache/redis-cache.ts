/**
 * ALAYA INSIDER — Shared Redis Cache Utility
 * Provides consistent caching patterns across all services.
 * Graceful degradation when Redis is unavailable.
 */

import { getRedis } from "@/lib/search/redis/client";

const DEFAULT_TTL = 300; // 5 minutes

export interface CacheOptions {
  ttl?: number;
  keyPrefix?: string;
}

/**
 * Get a value from cache
 */
export async function cacheGet<T>(key: string, options?: CacheOptions): Promise<T | null> {
  try {
    const redis = getRedis();
    const prefix = options?.keyPrefix || "alaya:cache";
    const cached = await redis.get(`${prefix}:${key}`);
    if (!cached) return null;
    return JSON.parse(cached) as T;
  } catch {
    return null; // Graceful degradation
  }
}

/**
 * Set a value in cache with TTL
 */
export async function cacheSet<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
  try {
    const redis = getRedis();
    const prefix = options?.keyPrefix || "alaya:cache";
    const ttl = options?.ttl || DEFAULT_TTL;
    await redis.setex(`${prefix}:${key}`, ttl, JSON.stringify(value));
  } catch {
    // Graceful degradation — cache miss is acceptable
  }
}

/**
 * Invalidate a specific cache key
 */
export async function cacheInvalidate(key: string, options?: CacheOptions): Promise<void> {
  try {
    const redis = getRedis();
    const prefix = options?.keyPrefix || "alaya:cache";
    await redis.del(`${prefix}:${key}`);
  } catch {
    // Graceful degradation
  }
}

/**
 * Invalidate all cache keys matching a pattern
 */
export async function cacheInvalidatePattern(pattern: string, options?: CacheOptions): Promise<void> {
  try {
    const redis = getRedis();
    const prefix = options?.keyPrefix || "alaya:cache";
    const keys = await redis.keys(`${prefix}:${pattern}`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch {
    // Graceful degradation
  }
}

/**
 * Cache-aside pattern with fallback function.
 * Returns cached value if available, otherwise calls fetchFn,
 * caches the result, and returns it.
 */
export async function cacheAside<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options?: CacheOptions
): Promise<T> {
  const cached = await cacheGet<T>(key, options);
  if (cached !== null) return cached;

  const value = await fetchFn();
  await cacheSet(key, value, options);
  return value;
}
