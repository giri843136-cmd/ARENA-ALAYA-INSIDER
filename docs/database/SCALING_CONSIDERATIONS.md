# ALAYA INSIDER — Scaling & Architecture Considerations

## Read-Heavy Workload
- Product browsing, search, recommendations dominate
- Heavy use of read replicas + caching

## Write Patterns
- User actions (views, bookmarks, reviews)
- Affiliate clicks & conversions
- Price history (time-series)
- AI generations

## Database Tiering (Production)
1. **Hot tier**: Redis (products, recs, user state)
2. **Warm tier**: Postgres read replicas + materialized views
3. **Cold tier**: Analytics warehouse (Snowflake / BigQuery) for revenue, search analytics, etc.
4. **Search tier**: Typesense cluster

## Connection Strategy
- Prisma + PgBouncer (or Prisma Accelerate)
- Separate pools for app vs background jobs

## Multi-Region (Future)
- Primary in US-East
- Read replicas in EU + APAC
- Typesense + Redis also multi-region

## Data Retention & Compliance
- Activity logs: 2 years
- Search analytics: 1 year (anonymized)
- Price history: forever (valuable for users)
- User data deletion: full cascade on request (GDPR/CCPA)

## Cost Optimization at Scale
- Aggressive caching
- Materialized views instead of complex joins for dashboards
- Partitioned time-series tables
- Cold storage for old logs

This architecture is intentionally over-engineered for the first 1–2 years so we never have to do painful refactors when we hit real scale.
