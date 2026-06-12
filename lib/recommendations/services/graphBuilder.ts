/**
 * ALAYA INSIDER — Graph Builder
 * Builds and queries the multi-layer recommendation graphs using Prisma relations + computed signals.
 */

import { prisma } from '@/lib/db/prisma';
import { RelationshipType, RecommendationSource } from '../types';

export class GraphBuilder {
  /**
   * Get product-to-product recommendations from the stored graph.
   */
  async getProductRecommendations(productId: string, limit = 12, types?: RelationshipType[]) {
    try {
      const where: any = { fromId: productId };
      if (types?.length) where.type = { in: types };

      const edges = await prisma.relatedProduct.findMany({
        where,
        orderBy: { score: 'desc' },
        take: limit,
        include: {
          to: {
            select: { id: true, slug: true, name: true, price: true, images: true, brand: { select: { name: true } } } as any
          }
        }
      });

      return edges.map(edge => ({
        id: (edge.to as any).id,
        type: 'product' as const,
        score: edge.score,
        compositeScore: edge.score * 100,
        source: edge.source as RecommendationSource,
        relationship: edge.type as RelationshipType,
        reason: this.generateReason(edge.type as RelationshipType, edge.source as RecommendationSource),
        metadata: {
          brandId: (edge.to as any).brand?.name,
          price: Number((edge.to as any).price),
          image: (edge.to as any).images?.[0],
        }
      })) as any;
    } catch {
      console.warn('[GraphBuilder] getProductRecommendations degraded (DB/relations unavailable) - empty safe result');
      return [];
    }
  }

  async getArticleRecommendations(articleId: string, limit = 8) {
    const edges = await prisma.relatedArticle.findMany({
      where: { fromId: articleId },
      orderBy: { score: 'desc' },
      take: limit,
      include: { to: { select: { id: true, slug: true, title: true, excerpt: true, featuredImage: true } } }
    });

    return edges.map(e => ({
      id: e.to.id,
      type: 'article' as const,
      score: e.score,
      compositeScore: e.score * 100,
      source: 'editorial' as RecommendationSource,
      relationship: 'related' as RelationshipType,
      reason: "Related reading",
      metadata: { title: e.to.title, image: e.to.featuredImage }
    }));
  }

  /**
   * Build behavioral co-viewed / co-purchased signals (from activity logs + search analytics).
   * In production this would be pre-computed nightly.
   */
  async getBehavioralRecommendations(productId: string, limit = 8) {
    // Simplified: pull from activity logs for demo
    const coViewed = await prisma.activityLog.groupBy({
      by: ['entityId'],
      where: {
        entityType: 'product',
        action: { in: ['view', 'add_to_cart'] },
        entityId: { not: productId },
      },
      _count: { entityId: true },
      orderBy: { _count: { entityId: 'desc' } },
      take: limit,
    });

    // In real system we would join to products and score properly
    return coViewed.map(item => ({
      id: item.entityId,
      type: 'product' as const,
      score: Math.min(95, 60 + (item._count.entityId || 0)),
      compositeScore: Math.min(95, 60 + (item._count.entityId || 0)),
      source: 'behavioral' as RecommendationSource,
      relationship: 'frequently_viewed_together' as RelationshipType,
      reason: "Frequently viewed together",
    }));
  }

  private generateReason(type: RelationshipType, source: RecommendationSource): string {
    const reasons: Record<string, string> = {
      editorial: "Editor's pick",
      behavioral: "People who viewed this also viewed",
      trending: "Trending right now",
      seasonal: "Perfect for this season",
      affinity: "Based on your interests",
    };
    return reasons[source] || "Recommended for you";
  }
}

export const graphBuilder = new GraphBuilder();
