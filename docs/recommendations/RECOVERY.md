# Recovery & Monitoring

## Failure Modes
- Graph becomes stale → run full refresh job
- Personalization feels repetitive → increase diversification weight or add more behavioral signals
- Low CTR on a module → surface in analytics, allow editorial overrides

## Monitoring
- Track CTR and revenue per module (via analytics API)
- Alert if recommendation count drops below threshold for popular products
- Monitor Redis cache hit rate for "For You"

## Health Check Pattern
Similar to search: expose a `/api/recommendations/health` that checks graph size and last refresh time.
