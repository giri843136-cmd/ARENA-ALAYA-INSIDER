/**
 * ALAYA INSIDER — CORS Middleware
 * Restricts API access to trusted origins only.
 */

const ALLOWED_ORIGINS = [
  "https://alayainsider.com",
  "https://www.alayainsider.com",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
];

// For production, only allow the main domain
const PRODUCTION_ORIGINS = [
  "https://alayainsider.com",
  "https://www.alayainsider.com",
];

/**
 * Check if an origin is allowed
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;

  const allowed = process.env.NODE_ENV === "production" ? PRODUCTION_ORIGINS : ALLOWED_ORIGINS;
  return allowed.includes(origin);
}

/**
 * Get the allowed origin for CORS headers
 * Returns the origin if allowed, or the default origin if not
 */
export function getAllowedOrigin(origin: string | null): string {
  if (origin && isOriginAllowed(origin)) {
    return origin;
  }
  return "https://alayainsider.com";
}

/**
 * CORS headers for API responses
 */
export function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = getAllowedOrigin(origin);

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-csrf-token, x-requested-with",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400", // 24 hours preflight cache
    "Vary": "Origin",
  };
}

/**
 * Handle CORS preflight (OPTIONS) requests
 */
export function handleCorsPreflight(origin: string | null): Response | null {
  if (!origin) return null;

  if (!isOriginAllowed(origin)) {
    return new Response(null, { status: 204 });
  }

  return new Response(null, {
    status: 204,
    headers: {
      ...getCorsHeaders(origin),
      "Access-Control-Max-Age": "86400",
    },
  });
}

/**
 * Apply CORS headers to a response
 */
export function applyCorsHeaders(response: Response, origin: string | null): Response {
  const headers = getCorsHeaders(origin);
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
  return response;
}
