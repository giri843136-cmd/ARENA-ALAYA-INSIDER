/**
 * ALAYA INSIDER — Search Analytics Tracker
 * Lightweight, high-volume event capture. Feeds Typesense + Redis + Postgres.
 */

import { prisma } from '@/lib/db/prisma';
import { getRedis } from '../redis/client';

const redis = getRedis();

export async function trackSearchEvent(data: {
  query: string;
  resultCount: number;
  clicked?: boolean;
  userId?: string;
  filters?: string;
  latencyMs?: number;
}) {
  const timestamp = Date.now();

  // 1. Store in Postgres (for long-term analytics)
  await prisma.searchAnalytic.create({
    data: {
      query: data.query,
      resultCount: data.resultCount,
      clicked: data.clicked || false,
      userId: data.userId,
      createdAt: new Date(),
    },
  }).catch(() => {}); // Don't block on analytics failure

  // 2. Increment in Redis for real-time popular queries
  await redis.zincrby('search:popular', 1, data.query);
  await redis.zadd('search:recent', timestamp, data.query);

  // Keep only top 500 recent
  await redis.zremrangebyrank('search:recent', 0, -501);

  // 3. Track no-result queries for admin
  if (data.resultCount === 0) {
    await redis.sadd('search:noresults', data.query);
  }
}

export async function getPopularQueries(limit = 20) {
  const results = await redis.zrevrange('search:popular', 0, limit - 1, 'WITHSCORES');
  const queries: { query: string; count: number }[] = [];
  for (let i = 0; i < results.length; i += 2) {
    queries.push({ query: results[i], count: parseInt(results[i + 1]) });
  }
  return queries;
}

export async function getRecentSearches(limit = 10) {
  return redis.zrevrange('search:recent', 0, limit - 1);
}

export async function getNoResultQueries() {
  return redis.smembers('search:noresults');
}
