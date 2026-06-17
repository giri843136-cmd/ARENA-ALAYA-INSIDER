# ALAYA INSIDER — Backend + CMS + Auth + APIs (Phase 9)

**Completely new platform layer. All previous phases (frontend, admin UI, search, recommendations, AI) remain 100% frozen.**

## What Was Built

A production-grade backend platform worthy of Stripe/Notion/Airbnb/Vercel.

### Major Systems
- Authentication (NextAuth + Prisma + magic links + OAuth)
- Full RBAC with fine-grained permissions and impersonation
- CMS services (ProductCMS, ArticleCMS, etc.) with publishing workflows
- Event-driven architecture (Redis pub/sub)
- BullMQ queues for all background work
- Email (Resend) + transactional templates
- Notification system (in-app + email)
- Unified Redis cache layer with smart invalidation
- Observability (Sentry + health checks + metrics)
- Security middleware + rate limiting
- Versioned REST API (v1) with good practices
- Comprehensive documentation

## How to Use

The new APIs live at `/api/v1/*`

Example:
```bash
curl http://localhost:3000/api/v1/products?page=1&limit=12
```

Workers:
```bash
npx tsx -e 'import { startAllWorkers } from "@/lib/backend/queues/bullmq"; startAllWorkers();'
```

## Philosophy
The backend is the platform that makes the beautiful editorial experience possible at scale. It is reliable, observable, secure, and designed for long-term maintainability.

No technical debt was introduced to any frozen surface.
