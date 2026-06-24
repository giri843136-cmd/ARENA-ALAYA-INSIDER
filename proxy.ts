import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { detectCurrencyFromRequest } from "@/lib/currency/detect";
import { applyCorsHeaders, isOriginAllowed } from "@/lib/backend/security/cors";

/**
 * Role hierarchy for admin route access.
 * Higher roles inherit access from lower ones.
 */
const ADMIN_ROLES = ["EDITOR", "SENIOR_EDITOR", "ADMIN", "SUPER_ADMIN"];

function hasAdminAccess(role: string | null): boolean {
  return role !== null && ADMIN_ROLES.includes(role);
}

async function getTokenFromRequest(request: NextRequest): Promise<{ id?: string; role?: string } | null> {
  // 1. Try to decode the JWT from the next-auth session cookie using the official getToken helper
  //    This works in both development and production when NEXTAUTH_SECRET is set.
  try {
    const token = await getToken({
      req: request as any,
      secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production",
      cookieName: process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
    });
    if (token) {
      return {
        id: (token as any).id as string,
        role: (token as any).role as string | undefined,
      };
    }
  } catch {
    // Fall through to fallback methods
  }

  // 2. Fallback: check for reverse proxy-injected headers (e.g. from nginx/auth gateway)
  const xRole = request.headers.get("x-user-role");
  const xUserId = request.headers.get("x-user-id");
  
  if (xRole && xUserId) {
    return { id: xUserId, role: xRole };
  }

  // 3. Development fallback — allow admin access locally with a header for testing
  if (process.env.NODE_ENV === "development") {
    const devRole = request.headers.get("x-dev-admin-role");
    if (devRole && hasAdminAccess(devRole)) {
      return { id: "dev_user", role: devRole };
    }
  }

  return null;
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

function forbiddenResponse() {
  return new NextResponse(
    JSON.stringify({ success: false, error: { code: "FORBIDDEN", message: "Insufficient permissions" } }),
    { status: 403, headers: { "Content-Type": "application/json" } }
  );
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // =============================================
  // AUTH GUARDS — Protect admin routes
  // =============================================

  // Protect /admin/* pages (but allow static assets and login)
  if (
    pathname.startsWith("/admin") &&
    !pathname.startsWith("/_next/") &&
    !pathname.includes(".") &&
    !pathname.startsWith("/icons/") &&
    pathname !== "/manifest.json" &&
    pathname !== "/sw.js" &&
    pathname !== "/offline.html"
  ) {
    const token = await getTokenFromRequest(request);

    if (!token || !hasAdminAccess(token.role || null)) {
      // API-style requests get 403 JSON
      if (pathname.startsWith("/api/")) {
        return forbiddenResponse();
      }
      // Page navigations get redirected to login
      return redirectToLogin(request);
    }
  }

  // Protect /api/v1/admin/* API routes + apply CORS
  if (pathname.startsWith("/api/v1/admin/")) {
    const token = await getTokenFromRequest(request);
    if (!token || !hasAdminAccess(token.role || null)) {
      return forbiddenResponse();
    }
    // Apply CORS headers
    const origin = request.headers.get("origin");
    if (origin && isOriginAllowed(origin)) {
      const response = NextResponse.next();
      return applyCorsHeaders(response as any, origin) as NextResponse;
    }
  }

  // =============================================
  // CURRENCY DETECTION — Skip for non-page routes
  // =============================================

  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/static/") ||
    pathname.includes(".") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/icons/") ||
    pathname === "/manifest.json" ||
    pathname === "/sw.js" ||
    pathname === "/offline.html"
  ) {
    return NextResponse.next();
  }

  // Currency detection priority:
  // 1. Existing cookie (user manually selected a currency from the dropdown)
  // 2. Query param override (for testing: ?currency=EUR)
  // 3. IP-based detection (Cloudflare / accept-language)
  
  const existingCookie = request.cookies.get("x-currency-code")?.value;
  const queryCurrency = request.nextUrl.searchParams.get("currency");
  
  let currency: { code: string; symbol: string; locale: string; name: string };
  
  if (existingCookie) {
    // User has a manually selected currency — use it
    currency = {
      code: existingCookie,
      symbol: request.cookies.get("x-currency-symbol")?.value || "$",
      locale: request.cookies.get("x-currency-locale")?.value || "en-US",
      name: existingCookie,
    };
  } else if (queryCurrency) {
    // Query param override (for testing)
    const CURRENCIES: Record<string, { code: string; symbol: string; locale: string; name: string }> = {
      USD: { code: "USD", symbol: "$", locale: "en-US", name: "US Dollar" },
      EUR: { code: "EUR", symbol: "\u20ac", locale: "de-DE", name: "Euro" },
      JPY: { code: "JPY", symbol: "\u00a5", locale: "ja-JP", name: "Japanese Yen" },
      AUD: { code: "AUD", symbol: "A$", locale: "en-AU", name: "Australian Dollar" },
      CAD: { code: "CAD", symbol: "C$", locale: "en-CA", name: "Canadian Dollar" },
      INR: { code: "INR", symbol: "\u20b9", locale: "en-IN", name: "Indian Rupee" },
    };
    currency = CURRENCIES[queryCurrency.toUpperCase()] || detectCurrencyFromRequest(request);
  } else {
    // IP-based detection
    currency = detectCurrencyFromRequest(request);
  }
  const response = NextResponse.next();
  const expires = new Date(Date.now() + 86400000).toUTCString();

  response.headers.set("x-currency-code", currency.code);
  response.headers.set("x-currency-symbol", encodeURIComponent(currency.symbol));
  response.headers.set("x-currency-locale", currency.locale);

  response.headers.append(
    "Set-Cookie",
    `x-currency-code=${currency.code}; Path=/; Expires=${expires}; SameSite=Lax`
  );
  response.headers.append(
    "Set-Cookie",
    `x-currency-symbol=${encodeURIComponent(currency.symbol)}; Path=/; Expires=${expires}; SameSite=Lax`
  );
  response.headers.append(
    "Set-Cookie",
    `x-currency-locale=${currency.locale}; Path=/; Expires=${expires}; SameSite=Lax`
  );

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/|static/|icons/|manifest\\.json|sw\\.js|offline\\.html).*)",
  ],
};
