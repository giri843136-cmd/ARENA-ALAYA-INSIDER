/**
 * ALAYA INSIDER — Core Recommendation Service
 * The single source of truth for all recommendations.
 * Hybrid, multi-source, personalized, and editorial.
 */

import { prisma } from '@/lib/db/prisma';
import { graphBuilder } from './graphBuilder';
import { scoringEngine } from './scoringEngine';
import { Recommendation, RecommendationContext, RecommendationModule } from '../types';

export class RecommendationService {
  /**
   * Get recommendations for a specific product page.
   */
  async getProductRecommendations(productId: string, context: RecommendationContext = {}): Promise<Recommendation[]> {
    try {
      const [graphRecs, behavioralRecs, popularRecs] = await Promise.all([
        graphBuilder.getProductRecommendations(productId, 12),
        graphBuilder.getBehavioralRecommendations(productId, 6),
        this.getPopularityRecommendations({ excludeId: productId, universe: context.currentUniverse, limit: 6 }),
      ]);

      const all = [...graphRecs, ...behavioralRecs, ...popularRecs];

      const scored = all.map(rec => scoringEngine.applyBoosts(rec, context));
      const ranked = scoringEngine.rankAndDiversify(scored, context.limit || 12);

      return ranked;
    } catch {
      console.warn('[Recommendations] Service degraded (DB/graph unavailable) - returning empty safe list');
      return [];
    }
  }

  /**
   * "For You" / Personalized recommendations.
   */
  async getPersonalizedRecommendations(context: RecommendationContext): Promise<Recommendation[]> {
    if (!context.userId) {
      return this.getTrendingRecommendations(context);
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: context.userId },
        include: {
          recentlyViewed: { take: 10, orderBy: { viewedAt: 'desc' } },
          favorites: { take: 20 },
          bookmarks: { take: 20 },
        },
      });

      if (!user) return this.getTrendingRecommendations(context);

    // Simple affinity from history
    const recentProductIds = user.recentlyViewed.map(r => r.productId);
    const favoriteIds = user.favorites.map(f => f.productId);

    const historyBased = await prisma.product.findMany({
      where: { id: { in: [...recentProductIds, ...favoriteIds] } },
      take: 6,
    });

    // Get recommendations from those seed products
    const recs: Recommendation[] = [];
    for (const seed of historyBased.slice(0, 4)) {
      const related = await graphBuilder.getProductRecommendations(seed.id, 4);
      recs.push(...related);
    }

    const scored = recs.map(r => scoringEngine.applyBoosts(r, context));
    return scoringEngine.rankAndDiversify(scored as any, context.limit || 16) as any;
    } catch {
      console.warn('[Recommendations] Personalized degraded - falling back to trending');
      return this.getTrendingRecommendations(context);
    }
  }

  /**
   * Trending / Popularity based.
   */
  async getTrendingRecommendations(context: RecommendationContext = {}) {
    const products = await prisma.product.findMany({
      where: {
        status: 'PUBLISHED',
        deletedAt: null,
        ...(context.currentUniverse && { universeId: context.currentUniverse }),
      },
      orderBy: [{ recommendationScore: 'desc' }, { reviewCount: 'desc' }],
      take: context.limit || 12,
    });

    return products.map(p => ({
      id: p.id,
      type: 'product' as const,
      score: p.recommendationScore,
      compositeScore: p.recommendationScore,
      source: 'trending' as const,
      relationship: 'trending' as const,
      reason: "Trending in the community",
      metadata: { price: Number(p.price), image: (p as any).images?.[0] || null },
    }));
  }

  async getPopularityRecommendations({ excludeId, universe, limit = 8 }: any) {
    const products = await prisma.product.findMany({
      where: {
        status: 'PUBLISHED',
        deletedAt: null,
        ...(excludeId && { id: { not: excludeId } }),
        ...(universe && { universe: { slug: universe } }),
      },
      orderBy: { reviewCount: 'desc' },
      take: limit,
    });

    return products.map((p: any) => ({
      id: p.id,
      type: 'product' as const,
      score: Math.min(92, 65 + (p.reviewCount / 10)),
      compositeScore: Math.min(92, 65 + (p.reviewCount / 10)),
      source: 'popularity' as const,
      relationship: 'related' as const,
      reason: "Most loved by readers",
      metadata: {},
    })) as any; // permissive for Recommendation type in this build
  }

  /**
   * Article recommendations.
   */
  async getArticleRecommendations(articleId: string, context: RecommendationContext = {}) {
    const graphRecs = await graphBuilder.getArticleRecommendations(articleId, 8);
    const trending = await this.getTrendingArticles(6);

    const combined = [...graphRecs, ...trending];
    return scoringEngine.rankAndDiversify(combined as any, context.limit || 8);
  }

  private async getTrendingArticles(limit: number) {
    const articles = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });

    return articles.map(a => ({
      id: a.id,
      type: 'article' as const,
      score: 80,
      compositeScore: 80,
      source: 'trending' as const,
      relationship: 'related' as const,
      reason: "Popular right now",
    }));
  }

  /**
   * Get recommendations for a specific module (used by UI later).
   */
  async getForModule(module: RecommendationModule, context: RecommendationContext) {
    switch (module) {
      case 'related_products':
      case 'similar_products':
        return context.currentProductId 
          ? this.getProductRecommendations(context.currentProductId, context)
          : this.getTrendingRecommendations(context);
      case 'for_you':
      case 'based_on_history':
        return this.getPersonalizedRecommendations(context);
      case 'trending':
        return this.getTrendingRecommendations(context);
      case 'related_articles':
        return context.currentArticleId 
          ? this.getArticleRecommendations(context.currentArticleId, context)
          : this.getTrendingArticles(8);
      default:
        return this.getTrendingRecommendations(context);
    }
  }
}

export const recommendationService = new RecommendationService();
