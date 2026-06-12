# Global Observability

## Stack
- OpenTelemetry for traces across regions, queues, AI calls, search.
- Sentry for errors + performance (with release tracking).
- Vercel Analytics + Edge logs.
- Custom metrics (Redis, Postgres, Typesense, queue depths, AI tokens/cost per region).
- Status page for public + internal health dashboard.

## SLIs / SLOs (Phase 13 targets)
- Availability: 99.95%
- Search p95: < 80ms primary, < 150ms regional
- Product page p95: < 300ms
- AI task completion: > 99% within budget
- Recommendation freshness: < 15 min for trending

Error budgets tracked per region and system.

## On-call
Follow-the-sun with clear escalation. All alerts actionable with runbooks linked.
