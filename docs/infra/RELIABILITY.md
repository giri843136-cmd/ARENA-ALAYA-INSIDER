# Reliability & Observability

## Health Checks
- `/api/ops/health` (database, redis, typesense, basic downstreams)
- Vercel readiness/liveness probes

## SLIs / SLOs (starting targets)
- Availability: 99.9%
- p95 latency (web): < 400ms
- p95 search latency: < 80ms
- AI task completion rate: > 98%
- Affiliate link health: > 99.5%

## Observability Stack
- Vercel Analytics + Edge logs
- Sentry (errors + performance)
- OpenTelemetry (future) for distributed tracing across AI jobs, queues, search
- Custom health dashboards in frozen Admin

## Reliability Patterns
- Circuit breakers on external providers (AI, affiliate networks)
- Retries with exponential backoff
- Graceful degradation (show cached recommendations if AI or search is slow)
- Bulkheads (separate queue workers for AI vs email vs search sync)
