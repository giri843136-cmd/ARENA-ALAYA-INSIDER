/**
 * ALAYA INSIDER — Live Exchange Rate Integration
 * 
 * Uses exchangerate.host API (free, no key required) with
 * hardcoded fallback rates for development/offline use.
 */

const FALLBACK_RATES: Record<string, number> = {
  USD: 1, EUR: 0.92, JPY: 157.28, CAD: 1.37,
  AUD: 1.52, CNY: 7.24, INR: 83.47, MXN: 18.23,
  SEK: 10.52, NOK: 10.88, DKK: 6.87, CHF: 0.88, NZD: 1.65,
  SGD: 1.35, HKD: 7.82,
};

let cachedRates: Record<string, number> | null = null;
let lastFetch = 0;
const CACHE_TTL = 3600000; // 1 hour

/**
 * Fetch live exchange rates from the free API
 */
export async function fetchExchangeRates(): Promise<Record<string, number>> {
  const now = Date.now();
  if (cachedRates && now - lastFetch < CACHE_TTL) {
    return cachedRates;
  }

  let rates: Record<string, number>;

  try {
    const res = await fetch(
      "https://open.er-api.com/v6/latest/USD",
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data?.rates) {
      rates = { USD: 1, ...data.rates };
    } else {
      throw new Error("Invalid response format");
    }
  } catch {
    // Return fallback rates if API unavailable
    rates = FALLBACK_RATES;
  }

  cachedRates = rates;
  lastFetch = now;
  return rates;
}

/**
 * Get the exchange rate from USD to target currency
 */
export async function getRate(targetCurrency: string): Promise<number> {
  const rates = await fetchExchangeRates();
  return rates[targetCurrency] || 1;
}

/**
 * Convert a USD amount to target currency using live rates
 */
export async function convertCurrency(
  usdAmount: number,
  targetCurrency: string
): Promise<number> {
  const rate = await getRate(targetCurrency);
  return usdAmount * rate;
}

/**
 * Invalidate the rate cache to force a refresh
 */
export function invalidateCache(): void {
  cachedRates = null;
  lastFetch = 0;
}
