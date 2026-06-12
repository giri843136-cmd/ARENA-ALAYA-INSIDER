/**
 * ALAYA INSIDER — Recommendation Engine Types
 * Comprehensive, production-grade types for a Netflix/Amazon/Pinterest/Spotify level system.
 */

export type RelationshipType =
  | 'related'                    // Product → Product (editorial or similar)
  | 'similar'                    // Content similarity
  | 'frequently_bought_together' // Behavioral
  | 'frequently_viewed_together' // Behavioral
  | 'editorial_pick'
  | 'seasonal'
  | 'trending'
  | 'brand_affinity'
  | 'collection_affinity'
  | 'universe_affinity'
  | 'co_purchased'
  | 'co_viewed'
  | 'author_recommended'
  | 'topic_related'
  | 'search_related';

export type RecommendationSource =
  | 'editorial'
  | 'behavioral'
  | 'popularity'
  | 'trending'
  | 'seasonal'
  | 'affinity'
  | 'search'
  | 'semantic'
  | 'ai_assisted'
  | 'hybrid';

export type RecommendationModule =
  | 'related_products'
  | 'similar_products'
  | 'frequently_bought_together'
  | 'editors_picks'
  | 'currently_coveted'
  | 'most_loved'
  | 'trending'
  | 'seasonal'
  | 'for_you'
  | 'based_on_history'
  | 'related_articles'
  | 'continue_reading'
  | 'brand_recommendations'
  | 'collection_recommendations';

export interface Recommendation {
  id: string;
  type: 'product' | 'article' | 'brand' | 'collection';
  score: number;
  compositeScore: number;
  source: RecommendationSource;
  relationship: RelationshipType;
  reason?: string; // "Because you viewed...", "Editor's pick in Sanctuary", etc.
  metadata?: Record<string, any>;
}

export interface RecommendationContext {
  userId?: string;
  currentProductId?: string;
  currentArticleId?: string;
  currentUniverse?: string;
  currentBrandId?: string;
  recentProductIds?: string[];
  recentArticleIds?: string[];
  savedSearchQueries?: string[];
  season?: string;
  limit?: number;
}

export interface ScoringWeights {
  editorial: number;
  behavior: number;
  popularity: number;
  trending: number;
  affinity: number;
  freshness: number;
  seasonality: number;
  similarity: number;
  search: number;
}

export const DEFAULT_WEIGHTS: ScoringWeights = {
  editorial: 0.35,
  behavior: 0.25,
  popularity: 0.15,
  trending: 0.10,
  affinity: 0.08,
  freshness: 0.03,
  seasonality: 0.02,
  similarity: 0.01,
  search: 0.01,
};

export interface GraphEdge {
  fromId: string;
  toId: string;
  type: RelationshipType;
  score: number;
  source: RecommendationSource;
  createdAt: Date;
  metadata?: any;
}
