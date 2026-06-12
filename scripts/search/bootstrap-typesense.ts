/**
 * ALAYA INSIDER — Typesense Bootstrap Script
 * Creates collections and performs initial index for production.
 * Run after first deployment: npx tsx scripts/search/bootstrap-typesense.ts
 */

import { getTypesenseClient } from '../../lib/search/typesense/client';
import { ensureCollectionsExist, fullReindex } from '../../lib/search/typesense/indexer';

async function bootstrap() {
  console.log('🔍 Bootstrapping Typesense for production...');

  const client = getTypesenseClient();

  // Health check
  const health = await client.health.retrieve().catch(() => null);
  if (!health) {
    throw new Error('❌ Cannot connect to Typesense. Check TYPESENSE_* env vars.');
  }
  console.log('✅ Typesense connection healthy');

  // Create collections
  await ensureCollectionsExist();
  console.log('✅ Collections ensured');

  // Full reindex (safe for production with delta jobs later)
  await fullReindex();
  console.log('✅ Initial full reindex completed');

  console.log('🎉 Typesense bootstrap complete. Search is production-ready.');
}

bootstrap().catch((e) => {
  console.error('Bootstrap failed:', e);
  process.exit(1);
});