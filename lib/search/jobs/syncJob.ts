/**
 * ALAYA INSIDER — Background Sync Job (Delta + Full)
 * Run via cron or queue (Inngest / BullMQ / Temporal).
 * This is the heartbeat that keeps Typesense in sync with Postgres.
 */

import { fullReindex, indexAllProducts } from '../typesense/indexer';
import { getTypesenseClient } from '../typesense/client';

export async function runDeltaSync() {
  console.log('[Search Sync] Starting delta sync...');
  // In production: only index products updated since last run
  // For now we do a smart partial reindex
  await indexAllProducts(300);
  console.log('[Search Sync] Delta sync completed.');
}

export async function runFullReindex() {
  console.log('[Search Sync] Starting FULL reindex (use sparingly)...');
  await fullReindex();
}

export async function getSearchHealth() {
  const client = getTypesenseClient();
  try {
    const [products, articles] = await Promise.all([
      client.collections('products').retrieve(),
      client.collections('articles').retrieve(),
    ]);
    return {
      healthy: true,
      products: products.num_documents,
      articles: articles.num_documents,
      lastChecked: new Date().toISOString(),
    };
  } catch (e: any) {
    return { healthy: false, error: e.message };
  }
}
