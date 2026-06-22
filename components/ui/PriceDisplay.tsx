"use client";

import { useState } from "react";
import { useCurrency } from "@/lib/currency/useCurrency";

interface PriceDisplayProps {
  /** Price in USD — will be converted to the user's detected currency */
  usdAmount: number;
  /** Optional CSS class override */
  className?: string;
  /** Optional element type: span (default) or div */
  as?: "span" | "div";
}

/**
 * PriceDisplay — Renders a live-converted price using the detected currency.
 *
 * While exchange rates are loading, shows a subtle skeleton pulse.
 * Once rates are loaded, displays the price formatted in the user's currency.
 * Uses `suppressHydrationWarning` to prevent SSR/CSR text mismatches
 * since the display price depends on browser-only data (cookies, exchange rates).
 *
 * Example:
 *   <PriceDisplay usdAmount={68} className="text-lg font-medium" />
 */
export function PriceDisplay({ usdAmount, className = "", as: Tag = "span" }: PriceDisplayProps) {
  const { displayPrice, ratesLoaded, currency } = useCurrency();
  const [mounted] = useState(() => typeof window !== 'undefined');

  // Always render a placeholder during SSR to avoid text mismatch during hydration
  if (!mounted || !ratesLoaded) {
    return (
      <Tag
        className={`inline-block h-[1.2em] w-24 max-w-[160px] animate-pulse rounded bg-[#E4DDD5] align-middle ${className}`}
        aria-label="Loading price"
        aria-busy="true"
        suppressHydrationWarning
      >
        <span className="sr-only" suppressHydrationWarning>Loading price…</span>
      </Tag>
    );
  }

  return (
    <Tag className={className} data-currency={currency.code} suppressHydrationWarning>
      {displayPrice(usdAmount)}
    </Tag>
  );
}
