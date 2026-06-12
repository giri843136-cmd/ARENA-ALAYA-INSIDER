# ALAYA INSIDER — Global Architecture (Phase 13)

## Philosophy
Operate globally. Fail gracefully. Recover automatically. Deploy fearlessly.

Primary goal: Provide a premium, low-latency experience to users in US, EU, APAC, and emerging markets while maintaining 99.95%+ availability and sub-200ms p95 for critical paths (search, product pages, recommendations).

## High-Level Topology

- **Edge Layer**: Vercel Edge Network + Cloudflare (if fronting) for static, ISR, images, and edge functions.
- **Application Layer**: Vercel (primary) with multi-region deployments (US-East, EU-West, APAC-Singapore).
- **Data Layer**:
  - Primary Postgres (Neon or Aurora) in US-East with read replicas in EU and APAC.
  - Redis Cluster (Upstash or self-managed) with regional replicas.
  - Typesense Cluster (3+ nodes) with regional search instances + replication.
- **Background Systems**: BullMQ workers in each region, with cross-region job routing for heavy AI workloads.
- **AI Layer**: Anthropic/OpenAI with regional routing + automatic failover to secondary provider.
- **CDN & Media**: Cloudinary global + Vercel Edge for static assets.
- **Email**: Resend with regional sending + fallback providers.

## Traffic Steering
- Latency-based routing (primary).
- Geo-routing for compliance (GDPR data residency).
- Failover routing (automatic on health check failure).
- Canary + blue-green at edge.

## Consistency & Latency Tradeoffs
- Reads: Prefer regional replica (eventual consistency for non-critical data).
- Writes: Always primary with async replication.
- Search: Regional Typesense with periodic cross-region sync for global trending.
- Recommendations & AI: Regional cache with periodic global model refresh.

This architecture is designed for tens of millions of MAU with a small elite team.
