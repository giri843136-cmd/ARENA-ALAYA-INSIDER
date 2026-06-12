"use client";

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
 *
 * Example:
 *   <PriceDisplay usdAmount={68} className="text-lg font-medium" />
 */
export function PriceDisplay({ usdAmount, className = "", as: Tag = "span" }: PriceDisplayProps) {
  const { displayPrice, ratesLoaded, currency } = useCurrency();

  if (!ratesLoaded) {
    return (
      <Tag
        className={`inline-block h-5 w-20 animate-pulse rounded bg-[#E4DDD5] align-middle ${className}`}
        aria-label="Loading price"
        aria-busy="true"
      >
        <span className="sr-only">Loading price…</span>
      </Tag>
    );
  }

  return (
    <Tag className={className} data-currency={currency.code}>
      {displayPrice(usdAmount)}
    </Tag>
  );
}
