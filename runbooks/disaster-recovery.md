# Disaster Recovery Runbook

## Scenarios
1. Full region outage (primary Postgres + Vercel region)
2. Complete data loss in primary DB
3. Major security breach
4. Typesense / search cluster corruption

## Steps for Region Outage
1. Fail traffic to secondary region (Vercel + Neon read replica promotion or cross-region restore)
2. Restore latest PITR backup to new primary
3. Update connection strings in Vercel (environment variables)
4. Trigger full reindex of Typesense from restored DB
5. Validate via /api/ops/health + smoke tests on key flows (homepage, search, product pages, checkout/affiliate)
6. Communicate status
7. Post-mortem + update this runbook

Target RTO: 30-60 min | RPO: < 5 min
