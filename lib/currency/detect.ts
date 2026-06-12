/**
 * ALAYA INSIDER — IP-based Currency & Locale Detection
 * 
 * Detects the user's country from their IP address and maps
 * it to the appropriate currency and locale for display.
 */

export interface CurrencyInfo {
  code: string;
  symbol: string;
  locale: string;
  name: string;
}

const COUNTRY_CURRENCY_MAP: Record<string, CurrencyInfo> = {
  US: { code: "USD", symbol: "$", locale: "en-US", name: "US Dollar" },
  GB: { code: "GBP", symbol: "£", locale: "en-GB", name: "British Pound" },
  DE: { code: "EUR", symbol: "€", locale: "de-DE", name: "Euro" },
  FR: { code: "EUR", symbol: "€", locale: "fr-FR", name: "Euro" },
  IT: { code: "EUR", symbol: "€", locale: "it-IT", name: "Euro" },
  ES: { code: "EUR", symbol: "€", locale: "es-ES", name: "Euro" },
  NL: { code: "EUR", symbol: "€", locale: "nl-NL", name: "Euro" },
  BE: { code: "EUR", symbol: "€", locale: "nl-BE", name: "Euro" },
  AT: { code: "EUR", symbol: "€", locale: "de-AT", name: "Euro" },
  IE: { code: "EUR", symbol: "€", locale: "en-IE", name: "Euro" },
  PT: { code: "EUR", symbol: "€", locale: "pt-PT", name: "Euro" },
  AU: { code: "AUD", symbol: "A$", locale: "en-AU", name: "Australian Dollar" },
  CA: { code: "CAD", symbol: "C$", locale: "en-CA", name: "Canadian Dollar" },
  JP: { code: "JPY", symbol: "¥", locale: "ja-JP", name: "Japanese Yen" },
  CN: { code: "CNY", symbol: "¥", locale: "zh-CN", name: "Chinese Yuan" },
  IN: { code: "INR", symbol: "₹", locale: "en-IN", name: "Indian Rupee" },
  BR: { code: "BRL", symbol: "R$", locale: "pt-BR", name: "Brazilian Real" },
  MX: { code: "MXN", symbol: "Mex$", locale: "es-MX", name: "Mexican Peso" },
  SE: { code: "SEK", symbol: "kr", locale: "sv-SE", name: "Swedish Krona" },
  NO: { code: "NOK", symbol: "kr", locale: "nb-NO", name: "Norwegian Krone" },
  DK: { code: "DKK", symbol: "kr", locale: "da-DK", name: "Danish Krone" },
  CH: { code: "CHF", symbol: "CHF", locale: "de-CH", name: "Swiss Franc" },
  NZ: { code: "NZD", symbol: "NZ$", locale: "en-NZ", name: "New Zealand Dollar" },
  SG: { code: "SGD", symbol: "S$", locale: "en-SG", name: "Singapore Dollar" },
  HK: { code: "HKD", symbol: "HK$", locale: "en-HK", name: "Hong Kong Dollar" },
  KR: { code: "KRW", symbol: "₩", locale: "ko-KR", name: "South Korean Won" },
};

const DEFAULT_CURRENCY: CurrencyInfo = { code: "USD", symbol: "$", locale: "en-US", name: "US Dollar" };

// Country code → locale mapping for i18n
const COUNTRY_LOCALE_MAP: Record<string, string> = {
  US: "en", GB: "en", AU: "en", NZ: "en", SG: "en", IN: "en",
  FR: "fr", BE: "fr", CH: "de", CA: "en",
  DE: "de", AT: "de",
  ES: "es", MX: "es",
  JP: "ja",
  KR: "ko",
  CN: "zh",
  BR: "pt", PT: "pt",
  IT: "en",
  NL: "en", DK: "en", SE: "en", NO: "en", IE: "en",
};

/**
 * Get currency info from a country code
 */
export function getCurrencyFromCountry(countryCode: string): CurrencyInfo {
  return COUNTRY_CURRENCY_MAP[countryCode.toUpperCase()] || DEFAULT_CURRENCY;
}

/**
 * Detect currency from request headers (x-forwarded-for, cf-ipcountry, accept-language)
 */
export function detectCurrencyFromRequest(request: Request): CurrencyInfo {
  // 1. Try Cloudflare IP country header
  const cfCountry = request.headers.get("cf-ipcountry");
  if (cfCountry) {
    return getCurrencyFromCountry(cfCountry);
  }

  // 2. Try x-forwarded-for combined with accept-language for region hints
  const acceptLanguage = request.headers.get("accept-language") || "";
  
  // Parse accept-language for country code
  // e.g., "en-US,en;q=0.9" → "US"
  const regionMatch = acceptLanguage.match(/[A-Z]{2}(?=-[A-Z]{2})/);
  
  if (regionMatch) {
    return getCurrencyFromCountry(regionMatch[0]);
  }

  // 3. Default to USD
  return DEFAULT_CURRENCY;
}

/**
 * Get locale from country code for i18n routing
 */
export function getLocaleFromCountry(countryCode: string): string {
  return COUNTRY_LOCALE_MAP[countryCode.toUpperCase()] || "en";
}

/**
 * Detect preferred locale from request
 */
export function detectLocaleFromRequest(request: Request): string {
  // 1. Try Cloudflare country header
  const cfCountry = request.headers.get("cf-ipcountry");
  if (cfCountry) {
    return getLocaleFromCountry(cfCountry);
  }

  // 2. Try accept-language header
  const acceptLanguage = request.headers.get("accept-language") || "";
  const supportedLocales = ["en", "fr", "de", "es", "ja", "ko", "zh", "pt"];
  
  // Parse accept-language: "fr-FR,fr;q=0.9,en;q=0.8" → "fr"
  for (const lang of acceptLanguage.split(",")) {
    const code = lang.split(";")[0].split("-")[0].toLowerCase();
    if (supportedLocales.includes(code)) {
      return code;
    }
  }

  return "en";
}

/**
 * Format a price for display in the detected currency
 */
export function formatPrice(amount: number, currency: CurrencyInfo): string {
  try {
    return new Intl.NumberFormat(currency.locale, {
      style: "currency",
      currency: currency.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency.symbol}${amount.toFixed(2)}`;
  }
}


