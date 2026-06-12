# Multi-Region Strategy

## Regions (Initial)
- **Primary (US-East-1)**: Full stack (app, primary DB, primary Redis, primary Typesense, workers).
- **Secondary (EU-West-1)**: Read replicas, regional Redis, regional Typesense, edge workers.
- **DR (APAC-Singapore or US-West)**: Hot standby DB replica, cold cache, on-demand worker scaling.
- **Edge PoPs**: 50+ global via Vercel + Cloudflare for static + edge compute.

## Failover
1. Health check failure at primary → automatic traffic shift to secondary via Vercel + DNS.
2. DB failover: Promote EU read replica to primary (Neon/Aurora handles this).
3. Typesense: Promote regional replica or restore from snapshot.
4. Full region loss: DR region promotion + event replay from primary backup.

## Data Residency
- EU traffic prefers EU replicas for GDPR.
- Configurable per-user via account settings.
- Audit logs for cross-region data movement.

## Capacity
- Primary sized for 3x peak.
- Each replica sized for 1.5x regional peak.
- Auto-scaling for Vercel functions and workers.
