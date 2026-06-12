/**
 * ALAYA INSIDER — Unified Cache Layer (Redis)
 */

import { getRedis } from "@/lib/search/redis/client";

const redis = getRedis();

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const val = await redis.get(`alaya:cache:${key}`);
    return val ? JSON.parse(val) : null;
  },

  async set(key: string, value: any, ttlSeconds = 300) {
    await redis.setex(`alaya:cache:${key}`, ttlSeconds, JSON.stringify(value));
  },

  async invalidate(pattern: string) {
    const keys = await redis.keys(`alaya:cache:${pattern}`);
    if (keys.length) await redis.del(...keys);
  },

  // Convenience methods
  async getProduct(id: string) {
    return this.get(`product:${id}`);
  },

  async setProduct(id: string, product: any) {
    return this.set(`product:${id}`, product, 900); // 15 min
  },
};
