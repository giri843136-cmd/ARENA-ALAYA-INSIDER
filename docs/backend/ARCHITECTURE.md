# ALAYA INSIDER — Backend Platform Architecture (Phase 9)

## Principles
- Backend is a platform, not just APIs.
- All heavy work goes through queues and events.
- Auth + RBAC are first-class and enforced everywhere.
- Versioned public APIs (v1) are stable and well-documented.
- Everything is observable, auditable, and recoverable.

## Layers
1. Auth + RBAC (NextAuth + Prisma + custom policies)
2. CMS Services (ProductCMS, ArticleCMS, MediaCMS, etc.)
3. Event Bus (Redis pub/sub)
4. Queues (BullMQ)
5. Email (Resend)
6. Notifications
7. Cache (Redis)
8. Observability (Sentry + custom)
9. Security middleware
10. Versioned REST API (app/api/v1)

## Key Patterns
- Services are thin and composable.
- Events drive downstream systems (search, recommendations, AI).
- All AI work goes through the queue.
- Cache is invalidated via events.
- Full audit via ActivityLog.

This architecture is designed to support millions of users while keeping the editorial experience delightful.
