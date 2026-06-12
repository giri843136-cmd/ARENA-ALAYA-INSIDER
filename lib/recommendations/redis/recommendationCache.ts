/**
 * ALAYA INSIDER — Redis Caching for Recommendations
 * Hot cache for "For You", trending, and personalized results.
 */

import { getRedis } from '@/lib/search/redis/client';

const redis = getRedis();

export async function getCachedRecommendations(key: string) {
  const cached = await redis.get(`rec:${key}`);
  return cached ? JSON.parse(cached) : null;
}

export async function cacheRecommendations(key: string, data: any, ttlSeconds = 900) {
  await redis.setex(`rec:${key}`, ttlSeconds, JSON.stringify(data));
}

export async function getTrendingCache() {
  return redis.get('rec:trending:global');
}

export async function setTrendingCache(data: any) {
  await redis.setex('rec:trending:global', 3600, JSON.stringify(data));
}

export async function invalidateUserRecommendations(userId: string) {
  const pattern = `rec:user:${userId}:*`;
  const keys = await redis.keys(pattern);
  if (keys.length) await redis.del(...keys);
}
