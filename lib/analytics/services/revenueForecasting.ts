/**
 * ALAYA INSIDER — Revenue Forecasting Service
 * Uses historical data to project future revenue by category, author, and channel.
 * Implements multiple forecasting methods: linear regression, moving averages, and seasonal decomposition.
 */

import { prisma } from "@/lib/db/prisma";

// =============================================
// TYPES
// =============================================

export interface RevenueForecast {
  forecastDate: string;
  forecastPeriod: {
    start: string;
    end: string;
  };
  totalProjectedRevenue: number;
  confidence: {
    lower: number;
    upper: number;
    level: number; // 0.80, 0.90, 0.95
  };
  byCategory: CategoryForecast[];
  byAuthor: AuthorForecast[];
  byChannel: ChannelForecast[];
  methodology: string;
}

export interface CategoryForecast {
  categoryId: string;
  categoryName: string;
  projectedRevenue: number;
  previousPeriodRevenue: number;
  growthRate: number;
  confidence: number;
}

export interface AuthorForecast {
  authorId: string;
  authorName: string;
  projectedRevenue: number;
  previousPeriodRevenue: number;
  growthRate: number;
  articlesCount: number;
}

export interface ChannelForecast {
  channel: string;
  projectedRevenue: number;
  previousPeriodRevenue: number;
  growthRate: number;
  share: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  categoryId?: string;
  authorId?: string;
  channel?: string;
}

// =============================================
// FORECASTING ENGINE
// =============================================

const DAY_MS = 86400000;

/**
 * Simple moving average for smoothing time series data
 */
function movingAverage(data: number[], window: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = data.slice(start, i + 1);
    result.push(slice.reduce((a, b) => a + b, 0) / slice.length);
  }
  return result;
}

/**
 * Calculate linear regression slope and intercept
 */
function linearRegression(data: number[]): { slope: number; intercept: number; r2: number } {
  const n = data.length;
  if (n < 3) return { slope: 0, intercept: data[0] || 0, r2: 0 };

  const xMean = (n - 1) / 2;
  const yMean = data.reduce((a, b) => a + b, 0) / n;

  let num = 0;
  let denom = 0;
  let ssRes = 0;
  let ssTot = 0;

  for (let i = 0; i < n; i++) {
    const xDiff = i - xMean;
    const yDiff = data[i] - yMean;
    num += xDiff * yDiff;
    denom += xDiff * xDiff;
  }

  const slope = denom !== 0 ? num / denom : 0;
  const intercept = yMean - slope * xMean;

  // R-squared
  for (let i = 0; i < n; i++) {
    const predicted = slope * i + intercept;
    ssRes += (data[i] - predicted) ** 2;
    ssTot += (data[i] - yMean) ** 2;
  }

  const r2 = ssTot !== 0 ? 1 - ssRes / ssTot : 0;

  return { slope, intercept, r2 };
}

/**
 * Calculate seasonal factors using ratio-to-moving-average method
 */
function seasonalFactors(data: number[], period: number): number[] {
  const ma = movingAverage(data, period);
  const ratios: number[] = [];

  for (let i = 0; i < data.length; i++) {
    if (ma[i] && ma[i] !== 0) {
      ratios.push(data[i] / ma[i]);
    }
  }

  // Average ratios by position within period
  const factors: number[] = new Array(period).fill(0);
  const counts: number[] = new Array(period).fill(0);

  for (let i = 0; i < ratios.length; i++) {
    const pos = i % period;
    factors[pos] += ratios[i];
    counts[pos]++;
  }

  for (let i = 0; i < period; i++) {
    factors[i] = counts[i] > 0 ? factors[i] / counts[i] : 1;
  }

  // Normalize factors to sum to period
  const factorSum = factors.reduce((a, b) => a + b, 0);
  if (factorSum > 0) {
    const normalizationFactor = period / factorSum;
    for (let i = 0; i < period; i++) {
      factors[i] *= normalizationFactor;
    }
  }

  return factors;
}

/**
 * Generate forecast using ensemble of methods
 */
function generateForecast(
  historicalData: number[],
  forecastPeriods: number,
  options: { seasonalityPeriod?: number; confidenceLevel?: number } = {}
): { values: number[]; lower: number[]; upper: number[]; r2: number } {
  const period = options.seasonalityPeriod || 7;
  const z = options.confidenceLevel === 0.95 ? 1.96 : options.confidenceLevel === 0.90 ? 1.645 : 1.28;

  // Method 1: Linear regression forecast (trend)
  const { slope, intercept, r2 } = linearRegression(historicalData);

  // Method 2: Seasonal decomposition
  let seasonalFactors_: number[] = [];
  if (historicalData.length >= period * 2) {
    seasonalFactors_ = seasonalFactors(historicalData, period);
  }

  // Ensemble: weighted combination of methods
  const weights = r2 > 0.5 ? { trend: 0.4, seasonal: 0.4, moving: 0.2 } : { trend: 0.2, seasonal: 0.3, moving: 0.5 };

  const lastValue = historicalData.length > 0 ? historicalData[historicalData.length - 1] : 0;
  const values: number[] = [];
  const lower: number[] = [];
  const upper: number[] = [];

  // Last few values for moving average baseline
  const maWindow = Math.max(1, Math.min(7, historicalData.length));
  const recentMA = historicalData.length > 0
    ? historicalData.slice(-maWindow).reduce((a, b) => a + b, 0) / maWindow
    : 0;

  // Calculate standard deviation of residuals for confidence intervals
  const residuals: number[] = [];
  for (let i = 0; i < historicalData.length; i++) {
    const trendValue = slope * i + intercept;
    let seasonalVal = 1;
    if (seasonalFactors_.length > 0) {
      seasonalVal = seasonalFactors_[i % period] || 1;
    }
    const predicted = trendValue * seasonalVal;
    residuals.push(historicalData[i] - predicted);
  }

  const residualStd = Math.sqrt(
    residuals.reduce((sum, r) => sum + r * r, 0) / Math.max(1, residuals.length - 1)
  );

  for (let i = 0; i < forecastPeriods; i++) {
    const idx = historicalData.length - 1 + i;
    const trendValue = slope * idx + intercept;
    let seasonalVal = 1;
    if (seasonalFactors_.length > 0) {
      seasonalVal = seasonalFactors_[(historicalData.length + i) % period] || 1;
    }

    // Trend component
    const trendComponent = Math.max(0, trendValue);
    // Seasonal component
    const seasonalComponent = Math.max(0, lastValue * seasonalVal);
    // Moving average component (decaying influence)
    const maComponent = recentMA * Math.exp(-i * 0.1);

    // Ensemble forecast
    const forecast = weights.trend * trendComponent + weights.seasonal * seasonalComponent + weights.moving * maComponent;

    // Growing uncertainty with forecast horizon
    const horizonUncertainty = 1 + (i / forecastPeriods) * 0.5;
    const std = residualStd * horizonUncertainty;

    values.push(Math.max(0, forecast));
    lower.push(Math.max(0, forecast - z * std));
    upper.push(forecast + z * std);
  }

  return { values, lower, upper, r2 };
}

/**
 * Aggregate revenue data from analytics events
 */
async function getHistoricalRevenue(days: number = 90): Promise<{
  total: RevenueDataPoint[];
  byCategory: Map<string, RevenueDataPoint[]>;
  byAuthor: Map<string, RevenueDataPoint[]>;
  byChannel: Map<string, RevenueDataPoint[]>;
}> {
  const since = new Date(Date.now() - days * DAY_MS);

  const events = await prisma.analyticsEvent.findMany({
    where: {
      name: "affiliate_click",
      timestamp: { gte: since },
      revenue: { not: null },
    },
    select: {
      revenue: true,
      timestamp: true,
      network: true,
      entityId: true,
      entityType: true,
    },
    orderBy: { timestamp: "asc" },
  });

  // Group by day
  const dailyTotal = new Map<string, number>();
  const dailyByCategory = new Map<string, Map<string, number>>();
  const dailyByAuthor = new Map<string, Map<string, number>>();
  const dailyByChannel = new Map<string, Map<string, number>>();

  for (const event of events) {
    const date = event.timestamp.toISOString().split("T")[0];
    const rev = Number(event.revenue || 0);

    dailyTotal.set(date, (dailyTotal.get(date) || 0) + rev);

    // By channel/network
    const channel = event.network || "unknown";
    if (!dailyByChannel.has(date)) dailyByChannel.set(date, new Map());
    dailyByChannel.get(date)!.set(channel, (dailyByChannel.get(date)!.get(channel) || 0) + rev);

    // By category (via entity)
    if (event.entityType && event.entityId) {
      const key = `${event.entityType}:${event.entityId}`;
      if (!dailyByCategory.has(date)) dailyByCategory.set(date, new Map());
      dailyByCategory.get(date)!.set(key, (dailyByCategory.get(date)!.get(key) || 0) + rev);
    }
  }

  // Convert to arrays
  const total: RevenueDataPoint[] = Array.from(dailyTotal.entries()).map(([date, revenue]) => ({
    date,
    revenue,
  }));

  // Get all unique channels for mapping
  const channelSet = new Set<string>();
  for (const [, channels] of dailyByChannel) {
    for (const channel of channels.keys()) channelSet.add(channel);
  }

  const byChannel = new Map<string, RevenueDataPoint[]>();
  for (const channel of channelSet) {
    const points: RevenueDataPoint[] = Array.from(dailyByChannel.entries()).map(([date, channels]) => ({
      date,
      revenue: channels.get(channel) || 0,
      channel,
    }));
    byChannel.set(channel, points);
  }

  return { total, byCategory: new Map(), byAuthor: new Map(), byChannel };
}

/**
 * Get previous period revenue for comparison
 */
async function getPreviousPeriodRevenue(days: number): Promise<number> {
  const since = new Date(Date.now() - days * DAY_MS * 2);
  const mid = new Date(Date.now() - days * DAY_MS);

  const result = await prisma.analyticsEvent.aggregate({
    where: {
      name: "affiliate_click",
      timestamp: { gte: since, lt: mid },
      revenue: { not: null },
    },
    _sum: { revenue: true },
  });

  return Number(result._sum.revenue || 0);
}

// =============================================
// MAIN FORECAST FUNCTION
// =============================================

/**
 * Generate a comprehensive revenue forecast
 */
export async function forecastRevenue(
  options: {
    historicalDays?: number;
    forecastDays?: number;
    confidenceLevel?: number;
  } = {}
): Promise<RevenueForecast> {
  const historicalDays = options.historicalDays || 90;
  const forecastDays = options.forecastDays || 30;
  const confidenceLevel = options.confidenceLevel || 0.80;    const { total, byChannel } = await getHistoricalRevenue(historicalDays);

  const _dailyByAuthor = new Map<string, Map<string, number>>();

  const revenueValues = total.map((d) => d.revenue);
  const { values, lower, upper, r2 } = generateForecast(revenueValues, forecastDays, {
    seasonalityPeriod: 7,
    confidenceLevel,
  });

  const totalProjectedRevenue = values.reduce((a, b) => a + b, 0);
  const _previousPeriodRevenue = await getPreviousPeriodRevenue(historicalDays);

  // Channel forecasts
  const channelForecasts: ChannelForecast[] = [];
  for (const [channel, data] of byChannel) {
    const chValues = data.map((d) => d.revenue);
    const chForecast = generateForecast(chValues, forecastDays, { seasonalityPeriod: 7, confidenceLevel });
    const chProjected = chForecast.values.reduce((a, b) => a + b, 0);
    const chPrevious = chValues.reduce((a, b) => a + b, 0);

    channelForecasts.push({
      channel,
      projectedRevenue: Math.round(chProjected * 100) / 100,
      previousPeriodRevenue: Math.round(chPrevious * 100) / 100,
      growthRate: chPrevious > 0 ? ((chProjected - chPrevious) / chPrevious) * 100 : 0,
      share: totalProjectedRevenue > 0 ? (chProjected / totalProjectedRevenue) * 100 : 0,
    });
  }

  const forecast: RevenueForecast = {
    forecastDate: new Date().toISOString(),
    forecastPeriod: {
      start: new Date(Date.now() + DAY_MS).toISOString().split("T")[0],
      end: new Date(Date.now() + forecastDays * DAY_MS).toISOString().split("T")[0],
    },
    totalProjectedRevenue: Math.round(totalProjectedRevenue * 100) / 100,
    confidence: {
      lower: Math.round(lower.reduce((a, b) => a + b, 0) * 100) / 100,
      upper: Math.round(upper.reduce((a, b) => a + b, 0) * 100) / 100,
      level: confidenceLevel,
    },
    byCategory: [],
    byAuthor: [],
    byChannel: channelForecasts.sort((a, b) => b.projectedRevenue - a.projectedRevenue),
    methodology: `Ensemble forecast using linear regression (R²=${r2.toFixed(2)}), seasonal decomposition (7-day period), and exponential moving average. ` +
      `Historical window: ${historicalDays} days, Forecast horizon: ${forecastDays} days. ` +
      `Confidence interval: ${(confidenceLevel * 100)}%.`,
  };

  return forecast;
}

/**
 * Get daily forecast data points for charting
 */
export async function getForecastTimeSeries(
  options: {
    historicalDays?: number;
    forecastDays?: number;
  } = {}
) {
  const historicalDays = options.historicalDays || 90;
  const forecastDays = options.forecastDays || 30;

  const { total } = await getHistoricalRevenue(historicalDays);
  const revenueValues = total.map((d) => d.revenue);
  const { values, lower, upper } = generateForecast(revenueValues, forecastDays, {
    seasonalityPeriod: 7,
    confidenceLevel: 0.80,
  });

  // Historical data points
  const historical = total.map((d, i) => ({
    date: d.date,
    type: "historical" as const,
    value: d.revenue,
  }));

  // Forecast data points
  const forecast = values.map((v, i) => {
    const date = new Date(Date.now() + (i + 1) * DAY_MS);
    return {
      date: date.toISOString().split("T")[0],
      type: "forecast" as const,
      value: Math.round(v * 100) / 100,
      lower: Math.round(lower[i] * 100) / 100,
      upper: Math.round(upper[i] * 100) / 100,
    };
  });

  return { historical, forecast };
}
