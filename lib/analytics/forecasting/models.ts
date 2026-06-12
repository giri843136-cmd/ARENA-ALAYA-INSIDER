/**
 * Forecasting models (simple + hooks for advanced).
 */

import { Forecast } from "../types";

export async function forecastRevenue(horizonDays = 30): Promise<Forecast> {
  // In real system this would call a proper forecasting service or use dbt + Prophet.
  return {
    metric: "daily_revenue",
    current: 9420,
    predicted: 10280,
    confidence: 0.74,
    horizonDays,
    model: "exponential_smoothing_v2",
  };
}

export async function forecastAICost(): Promise<Forecast> {
  return {
    metric: "daily_ai_cost_usd",
    current: 47.2,
    predicted: 51.8,
    confidence: 0.81,
    horizonDays: 14,
    model: "linear_trend_with_seasonality",
  };
}
