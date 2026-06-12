# Redis Strategy for Recommendations

Keys:
- `rec:user:{userId}:for_you` — personalized (TTL 15-60 min)
- `rec:trending:global` — global trending (TTL 1 hour)
- `rec:product:{productId}:related` — product page recs (TTL 15 min)
- `rec:trending:{universe}` — per-universe trending

Invalidation:
- On significant user behavior → invalidate that user's keys
- On content publish → invalidate related product caches

This keeps "For You" fast while still feeling fresh.
