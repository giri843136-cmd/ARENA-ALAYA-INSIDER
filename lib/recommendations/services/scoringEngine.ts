/**
 * ALAYA INSIDER — Recommendation Scoring Engine
 * Composite, multi-factor scoring inspired by Netflix and Amazon.
 */

import { ScoringWeights, DEFAULT_WEIGHTS, Recommendation } from '../types';

export class ScoringEngine {
  private weights: ScoringWeights;

  constructor(weights: ScoringWeights = DEFAULT_WEIGHTS) {
    this.weights = weights;
  }

  /**
   * Calculate final composite score from multiple signals.
   */
  calculateCompositeScore(signals: {
    editorialScore?: number;
    behaviorScore?: number;
    popularityScore?: number;
    trendingScore?: number;
    affinityScore?: number;
    freshnessScore?: number;
    seasonalityScore?: number;
    similarityScore?: number;
    searchScore?: number;
  }): number {
    const w = this.weights;

    const score =
      (signals.editorialScore || 0) * w.editorial +
      (signals.behaviorScore || 0) * w.behavior +
      (signals.popularityScore || 0) * w.popularity +
      (signals.trendingScore || 0) * w.trending +
      (signals.affinityScore || 0) * w.affinity +
      (signals.freshnessScore || 0) * w.freshness +
      (signals.seasonalityScore || 0) * w.seasonality +
      (signals.similarityScore || 0) * w.similarity +
      (signals.searchScore || 0) * w.search;

    // Normalize to 0-100
    return Math.min(100, Math.max(0, Math.round(score * 100)));
  }

  /**
   * Apply business rules and boosts.
   */
  applyBoosts(rec: Recommendation, context: any): Recommendation {
    let finalScore = rec.compositeScore;

    // Editorial boost
    if (rec.source === 'editorial') finalScore = Math.min(100, finalScore * 1.15);

    // Trending boost
    if (rec.source === 'trending') finalScore = Math.min(100, finalScore * 1.08);

    // Personalization boost for "For You"
    if (context.userId && (rec.source === 'behavioral' || rec.source === 'affinity')) {
      finalScore = Math.min(100, finalScore * 1.12);
    }

    // Freshness decay for very old items
    if (rec.metadata?.publishedDaysAgo > 730) {
      finalScore *= 0.92;
    }

    return {
      ...rec,
      compositeScore: Math.round(finalScore),
    };
  }

  /**
   * Rank and diversify a list of recommendations.
   */
  rankAndDiversify(recommendations: Recommendation[], limit = 12): Recommendation[] {
    // Sort by composite score
    const sorted = [...recommendations].sort((a, b) => b.compositeScore - a.compositeScore);

    // Simple diversification: avoid too many from same brand/universe in top results
    const seenBrands = new Set<string>();
    const diversified: Recommendation[] = [];

    for (const rec of sorted) {
      const brand = rec.metadata?.brandId;
      if (brand && seenBrands.has(brand) && diversified.length > 4) continue;

      if (brand) seenBrands.add(brand);
      diversified.push(rec);

      if (diversified.length >= limit) break;
    }

    return diversified;
  }
}

export const scoringEngine = new ScoringEngine();
