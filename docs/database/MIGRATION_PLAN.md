# ALAYA INSIDER — Database Migration & Deployment Plan

## Phase 1 (Current — Done)
- Full normalized Prisma schema (`prisma/schema.prisma`)
- Enums, join tables, graph tables, indexes
- Initial seed using existing beautiful editorial data

## Phase 2 — Local Development
1. `cp .env.example .env.local`
2. Fill in local Postgres + Redis
3. `npm run db:generate`
4. `npm run db:migrate` (or `db:push` for rapid dev)
5. `npm run db:seed`

## Phase 3 — Staging
- Use managed Postgres (Neon / Supabase / Railway / Vercel Postgres)
- `prisma migrate deploy`
- Run production-like seed (smaller volume or anonymized)
- Enable read replicas early

## Phase 4 — Production (Millions of MAU)
- **Primary DB**: Highly provisioned Postgres (Neon / Crunchy / AWS Aurora)
- **Read replicas**: 2–4 replicas for product browsing, search, recommendations
- **Connection pooling**: PgBouncer (or Prisma Accelerate)
- **Partitioning**: 
  - `price_history`, `activity_logs`, `search_analytics` by month
- **Materialized views** for:
  - Trending products
  - "For You" aggregates
  - Universe bestsellers
- **Typesense** cluster (separate from DB) — primary semantic search index
- **Redis Cluster**:
  - Hot product cache (5–15 min TTL)
  - User sessions + preferences
  - Recommendation pre-computes
  - Rate limiting
- **Background jobs**: BullMQ / Inngest / Temporal (price monitoring, link health, AI jobs)

## Indexes & Performance
We have already added the critical ones in the schema. In production we will also add:
- GIN indexes on `products.search_score`, JSON fields where needed
- BRIN indexes on time-series tables
- Partial indexes (e.g. only `published` products)

## Backup & Disaster Recovery
- Daily full backups + continuous WAL archiving
- Point-in-time recovery (PITR) to 1 minute
- Cross-region replicas for DR
- `Backup` table in schema for audit

## Zero-Downtime Deployments
- Use `prisma migrate deploy` in CI
- Blue-green or canary releases via Vercel + database
- Feature flags for new schema changes

## Future Migrations (Examples)
- Add `vector` columns for embeddings (pgvector) once we have AI embeddings
- Add `tsvector` for Postgres FTS fallback
- Sharding strategy when we exceed ~50M products (unlikely in year 1)

This plan is built like Stripe and Notion would do it.
No shortcuts. Every decision documented.
