# ALAYA INSIDER — Redis Strategy (Production Scale)

## Layers

### 1. Hot Cache (Product + Brand)
- Key: `product:{slug}` or `product:id:{id}`
- TTL: 5–15 minutes (invalidate on publish/update)
- Stores: full product object + computed recommendation scores

### 2. Recommendation Graph Cache
- Pre-computed "For You", "Similar", "Frequently Bought Together"
- Key: `rec:product:{id}:similar`
- Stored as sorted sets (score + id)
- Refreshed nightly or on significant events

### 3. User Session + Personalization
- Sessions (if not using JWT only)
- `user:{id}:preferences`
- `user:{id}:recently_viewed` (capped list)
- `user:{id}:saved_searches`

### 4. Search & Discovery
- Popular queries (sorted set)
- Recent searches per user
- Search result cache (short TTL)

### 5. Rate Limiting & Abuse
- `rl:ip:{ip}:{route}`
- `rl:user:{id}:{action}`

### 6. Affiliate Intelligence
- Click attribution queue (before writing to DB)
- Link health cache

### 7. Background Job Queues
- BullMQ / Inngest for:
  - Price monitoring
  - Link health checks
  - AI content generation jobs
  - Recommendation graph rebuilds
  - Sitemap generation

## Invalidation Strategy
- On product publish/update → invalidate product cache + related recommendation keys
- On brand change → cascade
- On price history insert → optionally update cached prices

## Production Setup
- Redis Cluster (6+ nodes)
- AOF + RDB persistence
- Keyspace notifications for complex invalidation
- Separate Redis instance for queues if volume is high

This is how high-scale editorial + commerce platforms stay fast.
