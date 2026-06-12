"use client";

import { useCurrency } from "@/lib/currency/useCurrency";

/**
 * CurrencyIndicator — Subtle badge showing the active currency code.
 *
 * Shows a small pulse animation while exchange rates are loading,
 * then displays the detected currency code (e.g. "USD", "EUR", "GBP").
 *
 * Place in the header or footer for transparency about which currency
 * prices are displayed in.
 *
 * Example:
 *   <CurrencyIndicator />
 */
export function CurrencyIndicator({ className = "" }: { className?: string }) {
  const { currency, ratesLoaded } = useCurrency();

  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] tracking-[1.5px] text-[#8A8178] ${
        !ratesLoaded ? "animate-pulse" : ""
      } ${className}`}
      title={`Prices shown in ${currency.name} (${currency.code})`}
      aria-label={`Currency: ${currency.code}`}
    >
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full ${
          ratesLoaded ? "bg-green-400" : "bg-yellow-400"
        }`}
        aria-hidden="true"
      />
      {currency.code}
      {ratesLoaded ? "" : "…"}
    </span>
  );
}
