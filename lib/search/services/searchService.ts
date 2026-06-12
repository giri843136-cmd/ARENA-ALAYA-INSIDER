/**
 * ALAYA INSIDER — Core Search Service (Hybrid + Semantic ready)
 * High-performance, intent-aware search layer.
 */

import { getTypesenseClient } from '../typesense/client';

const client = getTypesenseClient();

export interface SearchOptions {
  query: string;
  filters?: string;
  sortBy?: string;
  page?: number;
  perPage?: number;
  collection?: string;
}

export async function searchProducts(options: SearchOptions) {
  const { query, filters, sortBy = 'searchScore:desc', page = 1, perPage = 24 } = options;

  const searchParams: any = {
    q: query || '*',
    query_by: 'name,description,brandName,tags',
    filter_by: filters || '',
    sort_by: sortBy,
    page,
    per_page: perPage,
    highlight_full_fields: 'name,description',
    typo_tokens_threshold: 1,
    num_typos: 2,
    prefix: true,
  };

  // Future: Add vector search when embeddings are available
  // searchParams.vector_query = `embedding:(${embeddingVector}, k:50)`;

  const results = await client.collections('products').documents().search(searchParams);

  return {
    hits: results.hits?.map((h: any) => h.document) || [],
    found: results.found || 0,
    page: results.page,
    perPage: results.per_page,
    searchTimeMs: results.search_time_ms,
  };
}

export async function searchAll(query: string, options: any = {}) {
  // Hybrid multi-collection search (Products + Articles + Brands prioritized)
  const [products, articles, brands] = await Promise.all([
    searchProducts({ query, ...options, perPage: 12 }),
    client.collections('articles').documents().search({
      q: query || '*',
      query_by: 'title,excerpt,authorName',
      per_page: 6,
    }),
    client.collections('brands').documents().search({
      q: query || '*',
      query_by: 'name,tagline',
      per_page: 6,
    }),
  ]);

  return {
    products: products.hits,
    articles: articles.hits?.map((h: any) => h.document) || [],
    brands: brands.hits?.map((h: any) => h.document) || [],
    totalFound: (products.found || 0) + (articles.found || 0) + (brands.found || 0),
  };
}

export async function autocomplete(query: string) {
  if (!query || query.length < 2) return [];

  const results = await client.collections('products').documents().search({
    q: query,
    query_by: 'name,brandName',
    per_page: 8,
    prefix: true,
    highlight_full_fields: 'name',
  });

  return results.hits?.map((h: any) => ({
    id: h.document.id,
    label: h.document.name,
    subtitle: h.document.brandName,
    type: 'product',
    url: `/products/${h.document.slug}`,
  })) || [];
}
