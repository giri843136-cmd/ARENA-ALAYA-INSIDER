/**
 * ALAYA INSIDER — Basic Rate Limiting (Production)
 * In-memory for simplicity; upgrade to Redis/Upstash in high-scale.
 */
const rateLimitMap = new Map<string, { count: number; reset: number }>();

export function rateLimit(ip: string, limit = 60, windowMs = 60000) {
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { count: 0, reset: now + windowMs };

  if (now > record.reset) {
    record.count = 0;
    record.reset = now + windowMs;
  }

  record.count++;
  rateLimitMap.set(ip, record);

  const remaining = Math.max(0, limit - record.count);
  const reset = Math.ceil((record.reset - now) / 1000);

  return {
    allowed: record.count <= limit,
    remaining,
    reset,
    limit,
  };
}

export function getClientIP(req: Request): string {
  return (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown').split(',')[0].trim();
}
