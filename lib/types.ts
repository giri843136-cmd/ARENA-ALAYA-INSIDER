/**
 * ALAYA INSIDER — Core Type Definitions
 * Handcrafted data models for a premium editorial platform.
 * Every field is intentional.
 */

export type UniverseSlug =
  | "sanctuary"
  | "culinary-studio"
  | "glow-atelier"
  | "signature-style"
  | "connected-living"
  | "ritual-reset"
  | "thoughtfully-yours"
  | "wander-edit";

export type SubcollectionSlug = string; // Dynamic but structured

export interface Universe {
  id: string;
  slug: UniverseSlug;
  title: string;
  subtitle: string;
  description: string;
  longDescription: string;
  heroImage: string;
  accentColor: string; // Hex for subtle theming
  subcollections: Subcollection[];
  featuredProducts: string[]; // Product IDs
  featuredArticles: string[]; // Article IDs
}

export interface Subcollection {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  universeSlug: UniverseSlug;
  heroImage: string;
  productIds: string[];
  articleIds: string[];
  curatedBy?: string;
}

export interface Brand {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  story: string;
  logo: string;
  heroImage: string;
  website?: string;
  country: string;
  founded: number;
  values: string[];
  affiliateNetworks: string[];
  productCount: number;
  featured: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brandId: string;
  brandName: string; // Denormalized for speed
  description: string;
  longDescription: string;
  price: number;
  currency: "USD" | "CAD" | "GBP" | "AUD";
  originalPrice?: number;
  images: string[];
  category: string;
  tags: string[];
  universe: UniverseSlug;
  subcollectionIds: string[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  affiliateLinks: AffiliateLink[];
  whyWeLove: string[];
  pros: string[];
  cons: string[];
  perfectFor: string[];
  alternatives: string[]; // Product IDs
  publishedAt: string;
  featured: boolean;
  bestseller: boolean;
  newArrival: boolean;
  /** Optional presentation fields used across editorial UI */
  color?: string;
  availability?: string;
  shortDescription?: string;
  featuredImage?: string;
}

export interface AffiliateLink {
  network: "Amazon" | "Walmart" | "Impact" | "CJ" | "ShareASale" | "BrandDirect";
  url: string;
  label: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  excerpt: string;
  content: string; // Rich text or MD in real impl
  authorId: string;
  authorName: string;
  publishedAt: string;
  readTime: number;
  coverImage: string;
  universe?: UniverseSlug;
  subcollection?: string;
  tags: string[];
  featured: boolean;
  heroQuote?: string;
}

export interface Author {
  id: string;
  name: string;
  slug: string;
  bio: string;
  avatar: string;
  role: string;
  social?: {
    instagram?: string;
    substack?: string;
  };
}

export interface Collection {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  coverImage: string;
  productIds: string[];
  articleIds: string[];
  type: "seasonal" | "curated" | "gift-guide" | "edit";
  publishedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  authorName: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
  helpful: number;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  savedProducts: string[];
  savedArticles: string[];
  preferences: Record<string, unknown>;
}

// Search & Discovery Types
export interface SearchResult {
  type: "product" | "brand" | "article" | "subcollection" | "universe";
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  url: string;
  score?: number;
}

export interface SearchSuggestion {
  query: string;
  type: "trending" | "recent" | "collection" | "brand";
}

// Navigation
export interface NavUniverse {
  slug: UniverseSlug;
  title: string;
  subcollections: { title: string; slug: string }[];
}
