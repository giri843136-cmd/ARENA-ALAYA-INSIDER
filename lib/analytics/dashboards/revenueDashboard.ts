/**
 * Revenue Dashboard data shape (for frozen admin consumption).
 */
import { revenueIntelligence } from "../services/revenueIntelligence";

export async function getRevenueDashboardData(days = 30) {
  const start = new Date(Date.now() - days * 86400000);
  const metrics = await revenueIntelligence.getRevenueMetrics(start, new Date());
  const forecast = await revenueIntelligence.getRevenueForecast(30);
  const cohorts = await revenueIntelligence.getCohorts();

  return {
    metrics,
    forecast,
    cohorts,
    generatedAt: new Date().toISOString(),
  };
}
