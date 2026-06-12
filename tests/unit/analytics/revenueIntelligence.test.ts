import { describe, it, expect } from 'vitest';
import { revenueIntelligence } from '@/lib/analytics/services/revenueIntelligence';

describe('RevenueIntelligenceService', () => {
  it('returns metrics structure', async () => {
    const metrics = await revenueIntelligence.getRevenueMetrics(
      new Date(Date.now() - 30 * 86400000),
      new Date()
    );
    expect(metrics).toHaveProperty('totalRevenue');
    expect(metrics).toHaveProperty('totalCommission');
    expect(metrics).toHaveProperty('byNetwork');
  });

  it('produces a forecast', async () => {
    const forecast = await revenueIntelligence.getRevenueForecast(30);
    expect(forecast).toHaveProperty('predicted');
    expect(forecast.confidence).toBeGreaterThan(0.5);
  });
});
