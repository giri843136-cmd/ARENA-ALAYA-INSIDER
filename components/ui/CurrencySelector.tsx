"use client";

import { useState, useEffect, useRef } from "react";
import { useCurrency } from "@/lib/currency/useCurrency";
import { ChevronDown } from "lucide-react";

interface CurrencyOption {
  code: string;
  symbol: string;
  locale: string;
  name: string;
  flag: string;
}

const CURRENCIES: CurrencyOption[] = [
  { code: "USD", symbol: "$", locale: "en-US", name: "US Dollar", flag: "🇺🇸" },
  { code: "EUR", symbol: "€", locale: "de-DE", name: "Euro", flag: "🇪🇺" },
  { code: "JPY", symbol: "¥", locale: "ja-JP", name: "Japanese Yen", flag: "🇯🇵" },
  { code: "AUD", symbol: "A$", locale: "en-AU", name: "Australian Dollar", flag: "🇦🇺" },
  { code: "CAD", symbol: "C$", locale: "en-CA", name: "Canadian Dollar", flag: "🇨🇦" },
  { code: "INR", symbol: "₹", locale: "en-IN", name: "Indian Rupee", flag: "🇮🇳" },
  { code: "CNY", symbol: "¥", locale: "zh-CN", name: "Chinese Yuan", flag: "🇨🇳" },
  { code: "SEK", symbol: "kr", locale: "sv-SE", name: "Swedish Krona", flag: "🇸🇪" },
  { code: "CHF", symbol: "CHF", locale: "de-CH", name: "Swiss Franc", flag: "🇨🇭" },
  { code: "NOK", symbol: "kr", locale: "nb-NO", name: "Norwegian Krone", flag: "🇳🇴" },
  { code: "NZD", symbol: "NZ$", locale: "en-NZ", name: "New Zealand Dollar", flag: "🇳🇿" },
  { code: "SGD", symbol: "S$", locale: "en-SG", name: "Singapore Dollar", flag: "🇸🇬" },
  { code: "HKD", symbol: "HK$", locale: "en-HK", name: "Hong Kong Dollar", flag: "🇭🇰" },
  { code: "MXN", symbol: "Mex$", locale: "es-MX", name: "Mexican Peso", flag: "🇲🇽" },
];

/**
 * CurrencySelector — Clickable currency indicator with manual dropdown selector.
 *
 * Shows the currently detected currency symbol and code.
 * Clicking opens a dropdown to manually switch to any supported currency.
 * When a currency is selected, it sets a cookie and reloads the page
 * so the middleware picks it up.
 *
 * Place in the navigation bar, next to the search button.
 *
 * Usage:
 *   <CurrencySelector />
 */
export function CurrencySelector({ className = "" }: { className?: string }) {
  const { currency, ratesLoaded } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleSelect = (option: CurrencyOption) => {
    const expires = new Date(Date.now() + 86_400_000).toUTCString();
    document.cookie = `x-currency-code=${option.code}; Path=/; Expires=${expires}; SameSite=Lax`;
    document.cookie = `x-currency-symbol=${encodeURIComponent(option.symbol)}; Path=/; Expires=${expires}; SameSite=Lax`;
    document.cookie = `x-currency-locale=${option.locale}; Path=/; Expires=${expires}; SameSite=Lax`;
    setOpen(false);
    // Reload to re-render all prices with the new currency
    window.location.reload();
  };

  const currentOption = CURRENCIES.find((c) => c.code === currency.code) || CURRENCIES[0];

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 h-9 px-3 rounded-xl border border-[#E4DDD5] bg-white text-xs text-[#6D655F] hover:border-[#7A6848] hover:text-[#26221E] transition-all active:scale-[0.985] ${
          !ratesLoaded ? "animate-pulse" : ""
        }`}
        aria-label={`Currency: ${currency.code}. Click to change.`}
        title="Click to change currency"
      >
        <span className="text-sm leading-none" aria-hidden="true">
          {currentOption.symbol}
        </span>
        <span className="font-medium tracking-[0.5px] hidden sm:inline">
          {currency.code}
        </span>
        <ChevronDown size={10} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[220px] bg-white border border-[#E4DDD5] rounded-2xl shadow-xl z-50 max-h-[400px] overflow-y-auto py-2">
          <div className="px-4 py-2 text-[9px] tracking-[2px] text-[#5C5249] uppercase border-b border-[#E4DDD5] mb-1">
            Select Currency
          </div>
          {CURRENCIES.map((option) => {
            const isActive = option.code === currency.code;
            return (
              <button
                key={option.code}
                onClick={() => handleSelect(option)}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors ${
                  isActive
                    ? "bg-[#7A6848]/10 text-[#26221E] font-medium"
                    : "text-[#6D655F] hover:bg-[#FAF7F4]"
                }`}
              >
                <span className="text-base" aria-hidden="true">{option.flag}</span>
                <div className="flex-1">
                  <span className="tabular-nums">{option.code}</span>
                  <span className="ml-1.5 text-xs text-[#5C5249]">{option.symbol}</span>
                </div>
                <span className="text-[10px] text-[#5C5249] truncate max-w-[80px]">
                  {option.name}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
