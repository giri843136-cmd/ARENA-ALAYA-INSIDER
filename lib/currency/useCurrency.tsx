"use client";

import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { formatPrice, type CurrencyInfo } from "./detect";
import { fetchExchangeRates } from "./rates";
import type { ReactNode } from "react";

const DEFAULT: CurrencyInfo = { code: "USD", symbol: "$", locale: "en-US", name: "US Dollar" };

const FALLBACK_RATES: Record<string, number> = {
  USD: 1, EUR: 0.92, JPY: 157.28, CAD: 1.37,
  AUD: 1.52, CNY: 7.24, INR: 83.47, MXN: 18.23,
  SEK: 10.52, NOK: 10.88, DKK: 6.87, CHF: 0.88, NZD: 1.65,
  SGD: 1.35, HKD: 7.82,
};

interface CurrencyContextType {
  currency: CurrencyInfo;
  displayPrice: (usdAmount: number) => string;
  ratesLoaded: boolean;
}

const Ctx = createContext<CurrencyContextType>({
  currency: DEFAULT,
  displayPrice: (a) => formatPrice(a, DEFAULT),
  ratesLoaded: false,
});

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyInfo>(DEFAULT);
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [ratesLoaded, setRatesLoaded] = useState(false);

  // Detect currency from cookies on mount
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const nameMap: Record<string, string> = {
      USD: "US Dollar", EUR: "Euro", JPY: "Japanese Yen",
      CAD: "Canadian Dollar", AUD: "Australian Dollar",
      CNY: "Chinese Yuan", INR: "Indian Rupee", MXN: "Mexican Peso",
      SEK: "Swedish Krona", NOK: "Norwegian Krone", DKK: "Danish Krone",
      CHF: "Swiss Franc", NZD: "New Zealand Dollar",
      SGD: "Singapore Dollar", HKD: "Hong Kong Dollar",
    };

    const code = getCookie("x-currency-code") || "USD";
    const symbol = getCookie("x-currency-symbol") || "$";
    const locale = getCookie("x-currency-locale") || "en-US";

    setCurrency({ code, symbol, locale, name: nameMap[code] || code });
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Fetch live exchange rates on mount and poll every hour
  useEffect(() => {
    let cancelled = false;

    const loadRates = async () => {
      try {
        const liveRates = await fetchExchangeRates();
        if (!cancelled) {
          setRates(liveRates);
          setRatesLoaded(true);
        }
      } catch {
        if (!cancelled) {
          setRates(FALLBACK_RATES);
          setRatesLoaded(true);
        }
      }
    };

    loadRates();

    const interval = setInterval(loadRates, 3600000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const displayPrice = useCallback(
    (usdAmount: number) => {
      const activeRates = rates ?? FALLBACK_RATES;
      const rate = activeRates[currency.code] || 1;
      return formatPrice(usdAmount * rate, currency);
    },
    [currency, rates]
  );

  return (
    <Ctx.Provider value={{ currency, displayPrice, ratesLoaded }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCurrency() {
  return useContext(Ctx);
}
