import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock global fetch
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

// Module-level mutable state persists across tests — reset before each
import { fetchExchangeRates, getRate, convertCurrency, invalidateCache } from "@/lib/currency/rates";

beforeEach(() => {
  mockFetch.mockReset();
  invalidateCache();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("fetchExchangeRates", () => {
  it("returns live rates from the API on success", async () => {
    const mockResponse = {
      rates: { EUR: 0.92, GBP: 0.79, JPY: 157.28 },
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const rates = await fetchExchangeRates();

    expect(rates.USD).toBe(1);
    expect(rates.EUR).toBe(0.92);
    expect(rates.GBP).toBe(0.79);
    expect(rates.JPY).toBe(157.28);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("returns cached rates on subsequent calls within TTL", async () => {
    const mockResponse = {
      rates: { EUR: 0.92 },
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    // First call — hits the API
    const first = await fetchExchangeRates();
    expect(first.EUR).toBe(0.92);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Second call — uses cache, no additional fetch
    const second = await fetchExchangeRates();
    expect(second.EUR).toBe(0.92);
    expect(mockFetch).toHaveBeenCalledTimes(1); // Still 1 — cached
  });

  it("falls back to hardcoded rates when the API fails", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const rates = await fetchExchangeRates();

    // Should contain fallback rates
    expect(rates.USD).toBe(1);
    expect(rates.EUR).toBe(0.92);
    expect(rates.GBP).toBe(0.79);
    expect(rates).toHaveProperty("JPY");
    expect(rates).toHaveProperty("KRW");
  });

  it("falls back when the API returns an HTTP error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
    });

    const rates = await fetchExchangeRates();

    expect(rates.USD).toBe(1);
    expect(rates.EUR).toBe(0.92);
  });

  it("falls back when the API returns invalid data", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ notRates: true }),
    });

    const rates = await fetchExchangeRates();

    expect(rates.USD).toBe(1);
    expect(rates.EUR).toBe(0.92);
  });

  it("calls the correct API endpoint", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ rates: { EUR: 0.92 } }),
    });

    await fetchExchangeRates();

    expect(mockFetch).toHaveBeenCalledWith(
      "https://open.er-api.com/v6/latest/USD",
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it("supports abort signal timeout", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ rates: { EUR: 0.92 } }),
    });

    await fetchExchangeRates();

    const callArg = mockFetch.mock.calls[0][1];
    expect(callArg.signal).toBeInstanceOf(AbortSignal);
  });
});

describe("getRate", () => {
  it("returns the exchange rate for a given currency", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ rates: { EUR: 0.92 } }),
    });

    const rate = await getRate("EUR");
    expect(rate).toBe(0.92);
  });

  it("returns 1 for unknown currencies", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ rates: { EUR: 0.92 } }),
    });

    const rate = await getRate("XYZ");
    expect(rate).toBe(1);
  });

  it("returns 1 for USD (base currency)", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ rates: { EUR: 0.92 } }),
    });

    const rate = await getRate("USD");
    expect(rate).toBe(1);
  });
});

describe("convertCurrency", () => {
  it("converts a USD amount to the target currency", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ rates: { EUR: 0.92 } }),
    });

    const result = await convertCurrency(100, "EUR");
    expect(result).toBe(92);
  });

  it("converts using fallback rates when API fails", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Offline"));

    const result = await convertCurrency(100, "JPY");
    expect(result).toBeGreaterThan(15000); // ~100 * 157.28
  });

  it("returns the same amount for USD", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ rates: { EUR: 0.92 } }),
    });

    const result = await convertCurrency(50, "USD");
    expect(result).toBe(50);
  });
});

describe("invalidateCache", () => {
  it("forces a fresh API call on the next fetch", async () => {
    // First call — prime the cache
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ rates: { EUR: 0.92 } }),
    });

    await fetchExchangeRates();
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Invalidate
    invalidateCache();

    // Second call — should hit the API again
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ rates: { EUR: 0.95 } }),
    });

    const rates = await fetchExchangeRates();
    expect(rates.EUR).toBe(0.95);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
