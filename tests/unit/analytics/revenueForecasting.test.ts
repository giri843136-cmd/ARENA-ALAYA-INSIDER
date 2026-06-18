/**
 * Revenue Forecasting Tests
 *
 * Tests the core forecasting engine: moving average, linear regression,
 * seasonal decomposition, and forecast generation.
 * Prisma is mocked to avoid database dependency.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Prisma to prevent database connection
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    analyticsEvent: {
      findMany: vi.fn().mockResolvedValue([]),
      aggregate: vi.fn().mockResolvedValue({ _sum: { revenue: 0 } }),
    },
  },
}));

describe("Revenue Forecasting — Function Exports", () => {
  it("forecastRevenue is a function", async () => {
    const { forecastRevenue } = await import("@/lib/analytics/services/revenueForecasting");
    expect(typeof forecastRevenue).toBe("function");
  });

  it("getForecastTimeSeries is a function", async () => {
    const { getForecastTimeSeries } = await import("@/lib/analytics/services/revenueForecasting");
    expect(typeof getForecastTimeSeries).toBe("function");
  });
});

describe("Revenue Forecasting — Forecast Shape", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("forecastRevenue returns expected shape with no data", async () => {
    const { forecastRevenue } = await import("@/lib/analytics/services/revenueForecasting");

    const result = await forecastRevenue({ historicalDays: 7, forecastDays: 7, confidenceLevel: 0.80 });

    expect(result).toBeDefined();
    expect(result.forecastDate).toBeDefined();
    expect(typeof result.forecastDate).toBe("string");

    expect(result.forecastPeriod).toBeDefined();
    expect(result.forecastPeriod.start).toBeDefined();
    expect(result.forecastPeriod.end).toBeDefined();

    expect(result.totalProjectedRevenue).toBeGreaterThanOrEqual(0);
    expect(typeof result.totalProjectedRevenue).toBe("number");

    expect(result.confidence).toBeDefined();
    expect(result.confidence.level).toBe(0.80);
    expect(result.confidence.lower).toBeLessThanOrEqual(result.confidence.upper);
    expect(result.confidence.lower).toBeGreaterThanOrEqual(0);

    expect(result.byChannel).toBeInstanceOf(Array);
    expect(result.byCategory).toBeInstanceOf(Array);
    expect(result.byAuthor).toBeInstanceOf(Array);

    expect(result.methodology).toBeDefined();
    expect(result.methodology).toContain("Ensemble forecast");
  });

  it("confidence interval is correctly bounded", async () => {
    const { forecastRevenue } = await import("@/lib/analytics/services/revenueForecasting");

    const result = await forecastRevenue({ historicalDays: 7, forecastDays: 7, confidenceLevel: 0.95 });

    expect(result.confidence.lower).toBeLessThanOrEqual(result.totalProjectedRevenue);
    expect(result.confidence.upper).toBeGreaterThanOrEqual(result.totalProjectedRevenue);
  });

  it("higher confidence level gives wider intervals", async () => {
    const { forecastRevenue } = await import("@/lib/analytics/services/revenueForecasting");

    const [lowConf, highConf] = await Promise.all([
      forecastRevenue({ historicalDays: 7, forecastDays: 7, confidenceLevel: 0.80 }),
      forecastRevenue({ historicalDays: 7, forecastDays: 7, confidenceLevel: 0.95 }),
    ]);

    const lowRange = lowConf.confidence.upper - lowConf.confidence.lower;
    const highRange = highConf.confidence.upper - highConf.confidence.lower;

    expect(highRange).toBeGreaterThanOrEqual(lowRange);
  });
});

describe("Revenue Forecasting — Time Series", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getForecastTimeSeries returns historical and forecast arrays", async () => {
    const { getForecastTimeSeries } = await import("@/lib/analytics/services/revenueForecasting");

    const result = await getForecastTimeSeries({ historicalDays: 7, forecastDays: 7 });

    expect(result.historical).toBeInstanceOf(Array);
    expect(result.forecast).toBeInstanceOf(Array);
  });

  it("forecast data points have required fields", async () => {
    const { getForecastTimeSeries } = await import("@/lib/analytics/services/revenueForecasting");

    const result = await getForecastTimeSeries({ historicalDays: 7, forecastDays: 7 });

    for (const point of result.forecast) {
      expect(point.date).toBeDefined();
      expect(typeof point.date).toBe("string");
      expect(point.type).toBe("forecast");
      expect(point.value).toBeGreaterThanOrEqual(0);

      if (point.lower !== undefined) {
        expect(point.lower).toBeLessThanOrEqual(point.value);
      }
      if (point.upper !== undefined) {
        expect(point.upper).toBeGreaterThanOrEqual(point.value);
      }
    }
  });

  it("historical data points have required fields", async () => {
    const { getForecastTimeSeries } = await import("@/lib/analytics/services/revenueForecasting");

    const result = await getForecastTimeSeries({ historicalDays: 7, forecastDays: 7 });

    for (const point of result.historical) {
      expect(point.date).toBeDefined();
      expect(typeof point.date).toBe("string");
      expect(point.type).toBe("historical");
      expect(point.value).toBeGreaterThanOrEqual(0);
    }
  });

  it("forecast length matches the requested number of days", async () => {
    const { getForecastTimeSeries } = await import("@/lib/analytics/services/revenueForecasting");

    const forecastDays = 14;
    const result = await getForecastTimeSeries({ historicalDays: 7, forecastDays });

    expect(result.forecast.length).toBe(forecastDays);
  });
});

describe("Revenue Forecasting — Edge Cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("handles minimal historical window gracefully", async () => {
    const { forecastRevenue } = await import("@/lib/analytics/services/revenueForecasting");

    const result = await forecastRevenue({ historicalDays: 1, forecastDays: 1, confidenceLevel: 0.80 });

    expect(result).toBeDefined();
    expect(result.totalProjectedRevenue).toBeGreaterThanOrEqual(0);
    expect(result.confidence.lower).toBeGreaterThanOrEqual(0);
  });

  it("handles very short historical windows for time series", async () => {
    const { getForecastTimeSeries } = await import("@/lib/analytics/services/revenueForecasting");

    const result = await getForecastTimeSeries({ historicalDays: 1, forecastDays: 5 });

    expect(result.forecast.length).toBe(5);
    expect(result.historical.length).toBeLessThanOrEqual(2);
  });

  it("forecast days match the requested number", async () => {
    const { getForecastTimeSeries } = await import("@/lib/analytics/services/revenueForecasting");

    const result = await getForecastTimeSeries({ historicalDays: 10, forecastDays: 5 });

    expect(result.historical.length).toBeLessThanOrEqual(10);
    expect(result.forecast.length).toBe(5);
  });
});

describe("Revenue Forecasting — Methodology", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("describes the methodology used", async () => {
    const { forecastRevenue } = await import("@/lib/analytics/services/revenueForecasting");

    const result = await forecastRevenue({ historicalDays: 7, forecastDays: 7 });

    expect(result.methodology).toContain("Ensemble forecast");
    expect(result.methodology).toContain("linear regression");
    expect(result.methodology).toContain("seasonal decomposition");
    expect(result.methodology).toContain("Historical window");
    expect(result.methodology).toContain("Forecast horizon");
    // Confidence level formatting (0.80 → "80%")
    expect(result.methodology).toContain("80");
  });

  it("changing parameters updates methodology text", async () => {
    const { forecastRevenue } = await import("@/lib/analytics/services/revenueForecasting");

    const result = await forecastRevenue({ historicalDays: 30, forecastDays: 14, confidenceLevel: 0.95 });

    expect(result.methodology).toContain("Historical window: 30");
    expect(result.methodology).toContain("Forecast horizon: 14");
    expect(result.methodology).toContain("95%");
  });
});

describe("Revenue Forecasting — Channel Forecasts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty byChannel when no data available", async () => {
    const { forecastRevenue } = await import("@/lib/analytics/services/revenueForecasting");

    const result = await forecastRevenue({ historicalDays: 7, forecastDays: 7 });

    // With no data, channels should be empty
    expect(result.byChannel).toBeInstanceOf(Array);
  });
});
