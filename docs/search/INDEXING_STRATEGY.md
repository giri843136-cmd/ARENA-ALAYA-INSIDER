# ALAYA INSIDER — Indexing & Sync Strategy

## Philosophy
Postgres = Source of Truth (rich normalized data)
Typesense = Blazing fast read-optimized search index

## Indexing Layers

1. **Full Reindex** (nightly or on major schema change)
   - `scripts/search/reindex.ts --full`

2. **Delta Sync** (every 5-15 min)
   - Only changed products/articles since last watermark
   - Implemented in `lib/search/jobs/syncJob.ts`

3. **Real-time Upsert** (on publish / price change / brand update)
   - Trigger from Prisma `afterSave` hooks or API routes
   - Use `client.collections('products').documents().upsert(doc)`

## Best Practices
- Keep document size small (we do)
- Use `searchScore` + `recommendationScore` for ranking
- Store denormalized fields (brandName, universe) for speed
- Prepare `embedding` vector field now for future vector search

## Recovery
If Typesense falls behind:
1. Run delta sync
2. If too far behind → full reindex
3. Use `lib/search/jobs/syncJob.ts` health check
