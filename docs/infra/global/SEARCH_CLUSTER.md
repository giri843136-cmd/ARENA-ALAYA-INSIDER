# Typesense Global Cluster Strategy

## Topology
- Primary 3-node cluster in us-east-1 (high availability, all shards).
- Read replicas / secondary clusters in eu-west-1 and apac.
- Cross-region replication for popular queries and global collections (brands, universes).
- Regional search for low-latency (products, articles).

## Scaling
- Shard by universe + popularity tier.
- Hot shards (trending products) replicated to all regions.
- Cold content (old articles) kept in primary only.

## Recovery
- Snapshot every 15 minutes.
- On cluster failure: restore from latest snapshot + replay recent events from Postgres.
- Health check: /api/ops/health includes Typesense cluster status + query latency per region.

## Performance Targets
- p95 search < 80ms in primary region.
- p95 < 150ms in regional replicas.
- Global trending queries served from nearest region.
