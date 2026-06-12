import { describe, it, expect } from 'vitest';
import { ScoringEngine, DEFAULT_WEIGHTS } from '@/lib/recommendations/services/scoringEngine';

describe('ScoringEngine', () => {
  const engine = new ScoringEngine(DEFAULT_WEIGHTS);

  it('calculates composite score correctly', () => {
    // Use high-signal inputs that should exceed 70 with DEFAULT_WEIGHTS (editorial 0.35 + behavior 0.25 + popularity 0.15 + ...)
    const score = engine.calculateCompositeScore({
      editorialScore: 0.95,
      behaviorScore: 0.92,
      popularityScore: 0.88,
      trendingScore: 0.85,
      affinityScore: 0.80,
    });
    expect(score).toBeGreaterThanOrEqual(70);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('applies editorial boost', () => {
    const rec = {
      id: 'p1',
      type: 'product' as const,
      score: 80,
      compositeScore: 80,
      source: 'editorial' as const,
      relationship: 'related' as const,
    };
    const boosted = engine.applyBoosts(rec, {});
    expect(boosted.compositeScore).toBeGreaterThan(80);
  });

  it('diversifies results by brand', () => {
    const recs = Array.from({ length: 10 }, (_, i) => ({
      id: `p${i}`,
      type: 'product' as const,
      score: 90 - i,
      compositeScore: 90 - i,
      source: 'popularity' as const,
      relationship: 'related' as const,
      metadata: { brandId: i % 3 === 0 ? 'brandA' : 'brandB' },
    }));
    const diversified = engine.rankAndDiversify(recs, 6);
    const brandACount = diversified.filter(r => r.metadata?.brandId === 'brandA').length;
    expect(brandACount).toBeLessThanOrEqual(3);
  });
});
