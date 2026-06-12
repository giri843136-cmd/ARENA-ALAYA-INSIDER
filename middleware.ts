import { NextRequest, NextResponse } from "next/server";
import { detectCurrencyFromRequest } from "@/lib/currency/detect";

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip detection for API routes, static files, and admin
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

  // Detect currency from request and set cookies for client-side detection
  const currency = detectCurrencyFromRequest(request);
  const response = NextResponse.next();
  const expires = new Date(Date.now() + 86400000).toUTCString();

  response.headers.set("x-currency-code", currency.code);
  response.headers.set("x-currency-symbol", currency.symbol);
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
    "/((?!_next/|api/|static/|admin/|icons/|manifest\\.json|sw\\.js|offline\\.html).*)",
  ],
};
