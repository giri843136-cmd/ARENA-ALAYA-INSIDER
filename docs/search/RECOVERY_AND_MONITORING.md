# Search Recovery & Monitoring

## Health Checks
- Typesense: `lib/search/typesense/client.ts` → `healthCheck()`
- Sync job: `lib/search/jobs/syncJob.ts` → `getSearchHealth()`

## Common Failure Modes & Recovery

1. **Typesense down**
   - Fall back to Prisma full-text search (implement as last resort)
   - Alert via Sentry / Slack

2. **Index out of date**
   - Run delta sync
   - Monitor document count vs Postgres count

3. **No results for good queries**
   - Surface in admin via `/api/search/analytics`
   - Editor adds synonyms or creates new content

4. **High latency**
   - Check Redis cache hit rate
   - Add more Typesense nodes
   - Tune `query_by` weights

## Recommended Alerts
- Typesense health check fails
- Document count drops > 5% unexpectedly
- > 50 no-result queries in last hour
- Search p95 latency > 150ms

## Backup
- Typesense snapshots (configure in production)
- Postgres is the ultimate backup
