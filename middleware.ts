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

  // Check for query param override first (for local testing: ?currency=EUR)
  const queryCurrency = request.nextUrl.searchParams.get("currency");
  const currency = queryCurrency
    ? (() => {
        const CURRENCIES: Record<string, { code: string; symbol: string; locale: string; name: string }> = {
          USD: { code: "USD", symbol: "$", locale: "en-US", name: "US Dollar" },
          EUR: { code: "EUR", symbol: "€", locale: "de-DE", name: "Euro" },
          GBP: { code: "GBP", symbol: "£", locale: "en-GB", name: "British Pound" },
          JPY: { code: "JPY", symbol: "¥", locale: "ja-JP", name: "Japanese Yen" },
          AUD: { code: "AUD", symbol: "A$", locale: "en-AU", name: "Australian Dollar" },
          CAD: { code: "CAD", symbol: "C$", locale: "en-CA", name: "Canadian Dollar" },
          KRW: { code: "KRW", symbol: "₩", locale: "ko-KR", name: "South Korean Won" },
          BRL: { code: "BRL", symbol: "R$", locale: "pt-BR", name: "Brazilian Real" },
          INR: { code: "INR", symbol: "₹", locale: "en-IN", name: "Indian Rupee" },
        };
        return CURRENCIES[queryCurrency.toUpperCase()] || detectCurrencyFromRequest(request);
      })()
    : detectCurrencyFromRequest(request);
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
