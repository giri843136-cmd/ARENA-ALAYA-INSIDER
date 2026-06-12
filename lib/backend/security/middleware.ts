/**
 * ALAYA INSIDER — Security Middleware
 */

import { NextRequest, NextResponse } from "next/server";

export async function securityHeaders(request: NextRequest) { // request retained for future IP/geo or advanced header logic
  void request; // intentionally unused in current basic impl
  const response = NextResponse.next();

  response.headers.set("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline';");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export function rateLimit(key: string, limit = 100, windowMs = 60000) {
  // Implement with Redis in production (params kept for future rate limit store integration)
  void key; void limit; void windowMs;
  return { allowed: true, remaining: 999 };
}
