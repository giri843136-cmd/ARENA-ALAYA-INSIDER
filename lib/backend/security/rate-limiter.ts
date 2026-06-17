/**
 * ALAYA INSIDER — Production Rate Limiter
 * Uses Upstash Redis for distributed rate limiting
 * Falls back to in-memory when Redis is unavailable
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Duration type matching @upstash/ratelimit's expected shape
type Duration = { seconds?: number; minutes?: number; hours?: number; days?: number };

function parseWindowToMs(d: Duration): number {
  return (d.seconds || 0) * 1000 + (d.minutes || 0) * 60000 + (d.hours || 0) * 3600000 + (d.days || 0) * 86400000;
}

function parseWindowString(w: string): Duration {
  const m = w.match(/^(\d+)\s*(s|m|h|d)$/);
  if (!m) return { minutes: 1 };
  const v = parseInt(m[1]);
  switch (m[2]) {
    case "s": return { seconds: v };
    case "m": return { minutes: v };
    case "h": return { hours: v };
    case "d": return { days: v };
    default: return { minutes: 1 };
  }
}

// Centralized rate limit configurations
export const RATE_LIMITS = {
  auth: { requests: 5, duration: parseWindowString("15 m"), label: "Auth" },
  login: { requests: 5, duration: parseWindowString("15 m"), label: "Login" },
  twoFactorVerify: { requests: 10, duration: parseWindowString("5 m"), label: "2FA Verify" },
  search: { requests: 30, duration: parseWindowString("1 m"), label: "Search" },
  newsletter: { requests: 5, duration: parseWindowString("1 h"), label: "Newsletter" },
  comments: { requests: 10, duration: parseWindowString("1 m"), label: "Comments" },
  contact: { requests: 3, duration: parseWindowString("1 h"), label: "Contact" },
  admin: { requests: 100, duration: parseWindowString("1 m"), label: "Admin" },
  adminImport: { requests: 10, duration: parseWindowString("1 m"), label: "Admin Import" },
  api: { requests: 60, duration: parseWindowString("1 m"), label: "API" },
  webhook: { requests: 300, duration: parseWindowString("1 m"), label: "Webhook" },
} as const;

let upstashRatelimit: Ratelimit | null = null;
let memoryFallback: Map<string, { count: number; resetAt: number }> | null = null;

function getRatelimiter(config: { requests: number; duration: Duration; label: string }): Ratelimit {
  if (!upstashRatelimit) {
    try {
      const redis = Redis.fromEnv();
      upstashRatelimit = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(config.requests, config.duration as any),
        prefix: `ratelimit:${config.label}`,
        analytics: true,
      });
    } catch {
      // Redis unavailable — fall back to in-memory
      if (!memoryFallback) {
        memoryFallback = new Map();
        // Cleanup stale entries every 5 minutes
        setInterval(() => {
          const now = Date.now();
          for (const [key, record] of memoryFallback!) {
            if (now > record.resetAt) memoryFallback!.delete(key);
          }
        }, 300000);
      }
      // Return a proxy that uses in-memory
      return {
        limit: async (identifier: string) => {
          const now = Date.now();
          const windowMs = parseWindowToMs(config.duration);
          const key = `${config.label}:${identifier}`;
          const record = memoryFallback!.get(key) || { count: 0, resetAt: now + windowMs };

          if (now > record.resetAt) {
            record.count = 0;
            record.resetAt = now + windowMs;
          }

          record.count++;
          memoryFallback!.set(key, record);

          return {
            success: record.count <= config.requests,
            limit: config.requests,
            remaining: Math.max(0, config.requests - record.count),
            reset: Math.ceil((record.resetAt - now) / 1000),
          };
        },
      } as Ratelimit;
    }
  }
  return upstashRatelimit;
}

/**
 * Check rate limit for a given endpoint and identifier
 */
export async function checkRateLimit(
  identifier: string,
  endpoint: keyof typeof RATE_LIMITS
): Promise<{ allowed: boolean; remaining: number; reset: number }> {
  const config = RATE_LIMITS[endpoint];
  const limiter = getRatelimiter(config);
  const result = await limiter.limit(identifier);
  
  return {
    allowed: result.success,
    remaining: result.remaining,
    reset: result.reset,
  };
}

/**
 * Middleware-style rate limit check for API routes
 * Returns the identifier to use (based on IP or user ID)
 */
export function getRateLimitIdentifier(request: Request, userId?: string): string {
  if (userId) return `user:${userId}`;
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "127.0.0.1";
  return `ip:${ip}`;
}
