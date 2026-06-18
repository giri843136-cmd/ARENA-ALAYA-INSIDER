/**
 * Redis Cache Utility Tests
 *
 * Tests the shared caching utility: cache-aside pattern, TTL,
 * key namespacing, and graceful degradation when Redis is unavailable.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Redis client
const mockRedis = {
  get: vi.fn(),
  setex: vi.fn(),
  del: vi.fn(),
  keys: vi.fn(),
};

vi.mock("@/lib/search/redis/client", () => ({
  getRedis: vi.fn(() => mockRedis),
}));

describe("Redis Cache — cacheGet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when cache miss", async () => {
    const { cacheGet } = await import("@/lib/backend/cache/redis-cache");
    mockRedis.get.mockResolvedValue(null);

    const result = await cacheGet("test-key");
    expect(result).toBeNull();
    expect(mockRedis.get).toHaveBeenCalledWith("alaya:cache:test-key");
  });

  it("returns parsed value when cache hit", async () => {
    const { cacheGet } = await import("@/lib/backend/cache/redis-cache");
    mockRedis.get.mockResolvedValue(JSON.stringify({ name: "test", value: 42 }));

    const result = await cacheGet<{ name: string; value: number }>("test-key");
    expect(result).toEqual({ name: "test", value: 42 });
  });

  it("uses custom prefix when provided", async () => {
    const { cacheGet } = await import("@/lib/backend/cache/redis-cache");
    mockRedis.get.mockResolvedValue(null);

    await cacheGet("custom-key", { keyPrefix: "myapp" });
    expect(mockRedis.get).toHaveBeenCalledWith("myapp:custom-key");
  });

  it("returns null when Redis throws (graceful degradation)", async () => {
    const { cacheGet } = await import("@/lib/backend/cache/redis-cache");
    mockRedis.get.mockRejectedValue(new Error("Connection refused"));

    const result = await cacheGet("fail-key");
    expect(result).toBeNull();
  });
});

describe("Redis Cache — cacheSet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sets value with default TTL", async () => {
    const { cacheSet } = await import("@/lib/backend/cache/redis-cache");
    mockRedis.setex.mockResolvedValue("OK");

    await cacheSet("key", { data: 123 });
    expect(mockRedis.setex).toHaveBeenCalledWith(
      "alaya:cache:key",
      300,
      JSON.stringify({ data: 123 })
    );
  });

  it("sets value with custom TTL", async () => {
    const { cacheSet } = await import("@/lib/backend/cache/redis-cache");
    mockRedis.setex.mockResolvedValue("OK");

    await cacheSet("key", "value", { ttl: 60 });
    expect(mockRedis.setex).toHaveBeenCalledWith(
      "alaya:cache:key",
      60,
      JSON.stringify("value")
    );
  });

  it("does not throw when Redis fails", async () => {
    const { cacheSet } = await import("@/lib/backend/cache/redis-cache");
    mockRedis.setex.mockRejectedValue(new Error("Timeout"));

    await expect(cacheSet("key", "value")).resolves.toBeUndefined();
  });
});

describe("Redis Cache — cacheInvalidate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes the specified key", async () => {
    const { cacheInvalidate } = await import("@/lib/backend/cache/redis-cache");
    mockRedis.del.mockResolvedValue(1);

    await cacheInvalidate("my-key");
    expect(mockRedis.del).toHaveBeenCalledWith("alaya:cache:my-key");
  });

  it("does not throw when delete fails", async () => {
    const { cacheInvalidate } = await import("@/lib/backend/cache/redis-cache");
    mockRedis.del.mockRejectedValue(new Error("Error"));

    await expect(cacheInvalidate("my-key")).resolves.toBeUndefined();
  });
});

describe("Redis Cache — cacheInvalidatePattern", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes keys matching pattern", async () => {
    const { cacheInvalidatePattern } = await import("@/lib/backend/cache/redis-cache");
    mockRedis.keys.mockResolvedValue(["alaya:cache:coupon:best:p1", "alaya:cache:coupon:best:p2"]);
    mockRedis.del.mockResolvedValue(2);

    await cacheInvalidatePattern("coupon:best:*");
    expect(mockRedis.keys).toHaveBeenCalledWith("alaya:cache:coupon:best:*");
    expect(mockRedis.del).toHaveBeenCalledWith(
      "alaya:cache:coupon:best:p1",
      "alaya:cache:coupon:best:p2"
    );
  });

  it("handles no matching keys gracefully", async () => {
    const { cacheInvalidatePattern } = await import("@/lib/backend/cache/redis-cache");
    mockRedis.keys.mockResolvedValue([]);

    await expect(cacheInvalidatePattern("nonexistent:*")).resolves.toBeUndefined();
    expect(mockRedis.del).not.toHaveBeenCalled();
  });
});

describe("Redis Cache — cacheAside", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns cached value on cache hit", async () => {
    const { cacheAside } = await import("@/lib/backend/cache/redis-cache");
    const fetchFn = vi.fn().mockResolvedValue("fresh");
    mockRedis.get.mockResolvedValue(JSON.stringify("cached"));

    const result = await cacheAside("aside-key", fetchFn);
    expect(result).toBe("cached");
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("calls fetchFn and caches result on cache miss", async () => {
    const { cacheAside } = await import("@/lib/backend/cache/redis-cache");
    const fetchFn = vi.fn().mockResolvedValue("fresh-data");
    mockRedis.get.mockResolvedValue(null);
    mockRedis.setex.mockResolvedValue("OK");

    const result = await cacheAside("aside-key", fetchFn);
    expect(result).toBe("fresh-data");
    expect(fetchFn).toHaveBeenCalledOnce();
    expect(mockRedis.setex).toHaveBeenCalledWith(
      "alaya:cache:aside-key",
      300,
      JSON.stringify("fresh-data")
    );
  });

  it("handles Redis error by falling through to fetchFn", async () => {
    const { cacheAside } = await import("@/lib/backend/cache/redis-cache");
    const fetchFn = vi.fn().mockResolvedValue("fallback-data");
    mockRedis.get.mockRejectedValue(new Error("Down"));

    const result = await cacheAside("aside-key", fetchFn);
    expect(result).toBe("fallback-data");
    expect(fetchFn).toHaveBeenCalledOnce();
  });

  it("returns even when cache set fails after fetch", async () => {
    const { cacheAside } = await import("@/lib/backend/cache/redis-cache");
    const fetchFn = vi.fn().mockResolvedValue("data");
    mockRedis.get.mockResolvedValue(null);
    mockRedis.setex.mockRejectedValue(new Error("Write error"));

    const result = await cacheAside("aside-key", fetchFn);
    expect(result).toBe("data");
  });
});
