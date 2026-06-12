# Multi-Region Database Scaling

## Current (Phase 13 Target)
- **Primary**: Neon or AWS Aurora PostgreSQL (us-east-1) — provisioned for 50k+ concurrent connections via pooling (PgBouncer or Neon pooler).
- **Read Replicas**: 1 in eu-west-1, 1 in apac-singapore. Lag target < 100ms.
- **Connection Pooling**: PgBouncer in each region (or serverless pooler).
- **Partitioning**: analytics_events, activity_logs, price_history by month.
- **PITR**: Enabled with 30-day retention + cross-region backup copies.

## Failover Procedures
1. Detect primary failure via health checks + replica lag monitoring.
2. Promote best replica (lowest lag + health).
3. Update all application connection strings (via Vercel env + secret rotation).
4. Rebuild connection pools.
5. Run validation queries + smoke tests.
6. Re-enable writes on new primary.
7. Trigger full Typesense reindex from new primary.
8. Post-failover: restore replication in reverse.

## Archival
Cold data (>13 months) moved to S3 + Athena/Redshift Spectrum for BI.

## Consistency
- Critical paths (auth, purchases, affiliate attribution): Strong consistency to primary.
- Recommendations, search facets, trending: Eventual (regional replica acceptable).
