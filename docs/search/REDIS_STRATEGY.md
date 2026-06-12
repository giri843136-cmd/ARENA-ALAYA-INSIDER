# ALAYA INSIDER — Redis Search Layer

Used for:
- Real-time popular queries (sorted set)
- Recent searches per user / global
- Search result caching (short TTL)
- No-result query tracking (set)
- Autocomplete cache
- Trending queries

## Key Patterns
- `search:popular` — ZSET (query → count)
- `search:recent` — ZSET (timestamp → query)
- `search:cache:{query-hash}` — string (JSON results)
- `search:noresults` — SET

## TTLs
- Popular / recent: permanent (capped)
- Result cache: 5 minutes (tunable)
- No-results: permanent until manually cleared from admin

## Invalidation
On product publish/update: invalidate relevant cache keys (or just let them expire).
