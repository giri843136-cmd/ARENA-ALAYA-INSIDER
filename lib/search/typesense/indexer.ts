/**
 * ALAYA INSIDER — Typesense Indexing Service
 * Full reindex + delta updates. Designed for scale.
 */

import { getTypesenseClient } from './client';
import { prisma } from '@/lib/db/prisma';
import { productSchema, articleSchema, brandSchema } from './schemas';

const client = getTypesenseClient();

export async function ensureCollectionsExist() {
  try {
    const existing = await client.collections().retrieve().catch(() => []);
    const existingNames = existing.map((c: any) => c.name);  

    const schemas = [productSchema, articleSchema, brandSchema];

    for (const schema of schemas) {
      if (!existingNames.includes(schema.name)) {
        await client.collections().create(schema as any);
        console.log(`[Typesense] Created collection: ${schema.name}`);
      }
    }
  } catch {
    console.warn('[Typesense] ensureCollectionsExist failed gracefully - indexing will be skipped until service available');
  }
}

export async function indexAllProducts(batchSize = 500) {
  console.log('[Typesense] Starting full product reindex...');
  const products = await prisma.product.findMany({
    where: { status: 'PUBLISHED', deletedAt: null },
    include: { brand: true, universe: true },
    take: 100000, // safety
  });

  const documents = products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.shortDescription,
    longDescription: p.longDescription,
    brandName: p.brand?.name || '',
    brandId: p.brandId,
    universe: p.universe?.slug || '',
    universeId: p.universeId,
    price: Number(p.price),
    salePrice: p.salePrice ? Number(p.salePrice) : undefined,
    rating: p.rating,
    reviewCount: p.reviewCount,
    availability: p.availability,
    status: p.status,
    searchScore: p.searchScore,
    recommendationScore: p.recommendationScore,
    affiliatePriority: p.affiliatePriority,
    image: ((p as any).images?.[0] || (p as any).media?.[0]?.url || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800'),
    createdAt: Math.floor(p.createdAt.getTime() / 1000),
    publishedAt: p.publishedAt ? Math.floor(p.publishedAt.getTime() / 1000) : undefined,
  }));

  // Batch import
  for (let i = 0; i < documents.length; i += batchSize) {
    const batch = documents.slice(i, i + batchSize);
    await client.collections('products').documents().import(batch as any, { action: 'upsert' });  
    console.log(`[Typesense] Indexed ${Math.min(i + batchSize, documents.length)} / ${documents.length} products`);
  }

  console.log('[Typesense] Product reindex complete.');
}

export async function indexAllArticles() {
  const articles = await prisma.article.findMany({
    where: { status: 'PUBLISHED' },
    include: { author: true, universe: true },
  });

  const docs = articles.map(a => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    subtitle: a.subtitle,
    excerpt: a.excerpt,
    authorName: a.author?.name || '',
    authorId: a.authorId,
    universe: a.universe?.slug,
    readingTime: a.readingTime,
    difficulty: a.difficulty,
    featured: a.featured,
    publishedAt: Math.floor((a.publishedAt || a.createdAt).getTime() / 1000),
    image: a.featuredImage,
  }));

  if (docs.length) {
    await client.collections('articles').documents().import(docs as any, { action: 'upsert' });  
  }
  console.log(`[Typesense] Indexed ${docs.length} articles`);
}

export async function indexAllBrands() {
  const brands = await prisma.brand.findMany();
  const docs = brands.map(b => ({
    id: b.id,
    slug: b.slug,
    name: b.name,
    tagline: b.tagline,
    country: b.country,
    founded: b.founded,
    rating: b.rating,
    featured: b.featured,
    productCount: b.productCount,
    logo: b.logo,
  }));

  if (docs.length) {
    await client.collections('brands').documents().import(docs as any, { action: 'upsert' });  
  }
}

export async function fullReindex() {
  try {
    await ensureCollectionsExist();
    await Promise.all([
      indexAllProducts(),
      indexAllArticles(),
      indexAllBrands(),
    ]);
    console.log('[Typesense] Full reindex completed successfully.');
  } catch {
    console.warn('[Typesense] Full reindex failed gracefully (service unavailable or partial) - app continues');
  }
}
