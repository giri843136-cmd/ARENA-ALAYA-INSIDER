/**
 * ALAYA INSIDER — CSRF Protection
 * Double-submit cookie pattern for state-changing requests
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const CSRF_COOKIE = "__Host-csrf-token";
const CSRF_HEADER = "x-csrf-token";

// Safe methods that don't need CSRF protection
const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];

/**
 * Generate a CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Set the CSRF cookie on a response
 */
export function setCSRFCookie(response: NextResponse): void {
  const token = generateCSRFToken();
  response.cookies.set(CSRF_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });
}

/**
 * Validate CSRF token from request
 * Checks that the cookie token matches the header token
 */
export function validateCSRF(request: NextRequest): boolean {
  // Skip CSRF check for safe methods
  if (SAFE_METHODS.includes(request.method)) {
    return true;
  }

  const cookieToken = request.cookies.get(CSRF_COOKIE)?.value;
  const headerToken = request.headers.get(CSRF_HEADER);

  if (!cookieToken || !headerToken) {
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  if (cookieToken.length !== headerToken.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(cookieToken),
    Buffer.from(headerToken)
  );
}

/**
 * CSRF middleware for API routes
 * Returns the token for the first GET request, validates on state-changing requests
 */
export async function csrfMiddleware(request: NextRequest): Promise<NextResponse | null> {
  // For state-changing requests, validate CSRF
  if (!SAFE_METHODS.includes(request.method)) {
    if (!validateCSRF(request)) {
      return NextResponse.json(
        { success: false, error: { code: "CSRF_INVALID", message: "Invalid or missing CSRF token" } },
        { status: 403 }
      );
    }
  }

  return null; // No error
}

/**
 * Get CSRF token from cookie (for use in client-side forms)
 */
export function getCSRFTokenFromCookie(cookieValue: string | undefined): string | null {
  return cookieValue || null;
}
