/**
 * ALAYA INSIDER — Typesense Collection Schemas
 * Exact match to our rich normalized Prisma models.
 * Optimized for semantic + hybrid search, facets, and fast autocomplete.
 */

export const productSchema = {
  name: 'products',
  fields: [
    { name: 'id', type: 'string' },
    { name: 'slug', type: 'string' },
    { name: 'name', type: 'string' },
    { name: 'description', type: 'string' },
    { name: 'longDescription', type: 'string', optional: true },
    { name: 'brandName', type: 'string', facet: true },
    { name: 'brandId', type: 'string' },
    { name: 'universe', type: 'string', facet: true },
    { name: 'universeId', type: 'string' },
    { name: 'price', type: 'float', facet: true },
    { name: 'salePrice', type: 'float', optional: true },
    { name: 'rating', type: 'float', facet: true },
    { name: 'reviewCount', type: 'int32' },
    { name: 'availability', type: 'string', facet: true },
    { name: 'status', type: 'string', facet: true },
    { name: 'searchScore', type: 'float' },
    { name: 'recommendationScore', type: 'float' },
    { name: 'affiliatePriority', type: 'int32' },
    { name: 'tags', type: 'string[]', facet: true, optional: true },
    { name: 'color', type: 'string', facet: true, optional: true },
    { name: 'style', type: 'string', facet: true, optional: true },
    { name: 'season', type: 'string', facet: true, optional: true },
    { name: 'occasion', type: 'string', facet: true, optional: true },
    { name: 'country', type: 'string', facet: true, optional: true },
    { name: 'image', type: 'string', optional: true },
    { name: 'createdAt', type: 'int64' },
    { name: 'publishedAt', type: 'int64', optional: true },
    // Vector field for future semantic embeddings (pgvector → Typesense)
    { name: 'embedding', type: 'float[]', optional: true, num_dim: 1536 },
  ],
  default_sorting_field: 'searchScore',
  enable_nested_fields: true,
} as const;

export const articleSchema = {
  name: 'articles',
  fields: [
    { name: 'id', type: 'string' },
    { name: 'slug', type: 'string' },
    { name: 'title', type: 'string' },
    { name: 'subtitle', type: 'string', optional: true },
    { name: 'excerpt', type: 'string' },
    { name: 'authorName', type: 'string', facet: true },
    { name: 'authorId', type: 'string' },
    { name: 'universe', type: 'string', facet: true, optional: true },
    { name: 'readingTime', type: 'int32', facet: true },
    { name: 'difficulty', type: 'string', facet: true, optional: true },
    { name: 'tags', type: 'string[]', facet: true, optional: true },
    { name: 'featured', type: 'bool', facet: true },
    { name: 'publishedAt', type: 'int64' },
    { name: 'image', type: 'string', optional: true },
  ],
  default_sorting_field: 'publishedAt',
} as const;

export const brandSchema = {
  name: 'brands',
  fields: [
    { name: 'id', type: 'string' },
    { name: 'slug', type: 'string' },
    { name: 'name', type: 'string' },
    { name: 'tagline', type: 'string' },
    { name: 'country', type: 'string', facet: true },
    { name: 'founded', type: 'int32', optional: true },
    { name: 'rating', type: 'float', facet: true },
    { name: 'featured', type: 'bool', facet: true },
    { name: 'productCount', type: 'int32' },
    { name: 'logo', type: 'string', optional: true },
  ],
} as const;

export const collectionSchema = {
  name: 'collections',
  fields: [
    { name: 'id', type: 'string' },
    { name: 'slug', type: 'string' },
    { name: 'title', type: 'string' },
    { name: 'subtitle', type: 'string' },
    { name: 'type', type: 'string', facet: true },
    { name: 'publishedAt', type: 'int64', optional: true },
  ],
} as const;

export const universeSchema = {
  name: 'universes',
  fields: [
    { name: 'id', type: 'string' },
    { name: 'slug', type: 'string' },
    { name: 'title', type: 'string' },
    { name: 'subtitle', type: 'string' },
    { name: 'description', type: 'string' },
  ],
} as const;

export const authorSchema = {
  name: 'authors',
  fields: [
    { name: 'id', type: 'string' },
    { name: 'slug', type: 'string' },
    { name: 'name', type: 'string' },
    { name: 'role', type: 'string' },
  ],
} as const;

// Analytics & Operational Collections
export const searchAnalyticSchema = {
  name: 'search_analytics',
  fields: [
    { name: 'id', type: 'string' },
    { name: 'query', type: 'string' },
    { name: 'resultCount', type: 'int32' },
    { name: 'clicked', type: 'bool' },
    { name: 'userId', type: 'string', optional: true },
    { name: 'timestamp', type: 'int64' },
    { name: 'filters', type: 'string', optional: true },
  ],
} as const;

export const popularQuerySchema = {
  name: 'popular_queries',
  fields: [
    { name: 'query', type: 'string' },
    { name: 'count', type: 'int32' },
    { name: 'lastSeen', type: 'int64' },
  ],
} as const;

export const allSchemas = [
  productSchema,
  articleSchema,
  brandSchema,
  collectionSchema,
  universeSchema,
  authorSchema,
  searchAnalyticSchema,
  popularQuerySchema,
];
