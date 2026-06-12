/**
 * ALAYA INSIDER — Redis Client for Search Layer
 * Used for: popular queries, recent searches, cache, trending, autocomplete.
 */

import Redis from 'ioredis';

let redis: Redis | null = null;
let redisStub: any = null;

function createStubRedis() {
  return {
    ping: async () => 'PONG',
    get: async () => null,
    setex: async () => 'OK',
    lpush: async () => 0,
    rpop: async () => null,
    llen: async () => 0,
    ltrim: async () => 'OK',
    on: () => {},
    disconnect: async () => {},
    // Add more no-op methods as needed for graceful degradation
  } as any;
}

export function getRedis(): Redis {
  if (redis) return redis;

  const url = process.env.REDIS_URL || 'redis://localhost:6379';

  try {
    redis = new Redis(url, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
      reconnectOnError: (err) => {
        console.warn('[Redis] Reconnect on error:', err.message);
        return true;
      },
    });

    redis.on('error', (err) => {
      console.error('[Redis Search] Error (graceful):', err.message);
      // Do not crash the app
    });

    redis.on('connect', () => console.log('[Redis] Connected'));
  } catch {
    console.warn('[Redis] Failed to create client - using stub (queues/cache/search degraded but app continues)');
    redisStub = createStubRedis();
    return redisStub;
  }

  return redis;
}

export async function healthCheckRedis(): Promise<{ healthy: boolean; latencyMs?: number; error?: string }> {
  const start = Date.now();
  try {
    const r = getRedis();
    await r.ping();
    return { healthy: true, latencyMs: Date.now() - start };
  } catch (error: any) {
    return { healthy: false, error: error.message, latencyMs: Date.now() - start };
  }
}

export async function cacheSearchResults(key: string, data: any, ttlSeconds = 300) {
  const r = getRedis();
  await r.setex(`search:cache:${key}`, ttlSeconds, JSON.stringify(data));
}

export async function getCachedSearch(key: string) {
  const r = getRedis();
  const cached = await r.get(`search:cache:${key}`);
  return cached ? JSON.parse(cached) : null;
}
