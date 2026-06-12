/**
 * ALAYA INSIDER — Database Type Extensions & Helpers
 * Strongly typed utilities on top of Prisma.
 */

import type { Product, Brand, Article, Universe } from '@prisma/client';

// Re-export Prisma types for convenience across the app
export type {
  Product,
  Brand,
  Article,
  Universe,
  Subcollection,
  Collection,
  Author,
  Review,
  User,
  Notification,
  AIHistory,
  AffiliateLink,
} from '@prisma/client';

// Domain-specific composite types
export type ProductWithBrand = Product & {
  brand: Brand;
};

export type ArticleWithAuthor = Article & {
  author: { name: string; slug: string; avatar: string | null };
};

export type ProductWithRelations = Product & {
  brand: Brand;
  universe: Universe;
  affiliateLinks: any[];
};

// Search result types (for Typesense + internal)
export interface SearchProductResult {
  id: string;
  slug: string;
  name: string;
  brandName: string;
  price: number;
  image: string;
  rating: number;
  universe: string;
}

export interface EntityGraphNode {
  id: string;
  type: 'product' | 'brand' | 'article' | 'universe';
  title: string;
  score?: number;
}

// Recommendation types
export interface Recommendation {
  productId: string;
  score: number;
  reason: 'similar' | 'co-viewed' | 'editorial' | 'seasonal' | 'trending';
}
