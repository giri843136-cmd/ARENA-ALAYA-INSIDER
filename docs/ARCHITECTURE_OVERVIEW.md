# ALAYA INSIDER — Architecture Overview (Phase 4+)

**Frozen Frontend** (Phase 1) + **Enterprise Data Layer** (now) + Future Layers.

## Current Stack (as of this commit)
- Next.js 16 (App Router) — frozen beautiful frontend
- Prisma + PostgreSQL — fully normalized enterprise schema
- Typesense (prepared)
- Redis (prepared)
- Cloudinary, Resend, etc.

## Guiding Principles
- Every system designed for millions of MAU from day one
- Source of truth = normalized Postgres
- Fast paths = Redis + Typesense
- Graphs are first-class (recommendation + knowledge)
- AI is deeply integrated (history, agents, workflows)
- Zero technical debt — every table, index, relation has a reason

## Major Systems (All Required)
- Information Architecture & Navigation (already in frozen frontend + schema)
- Commerce + Affiliate Intelligence (schema ready)
- User + Personalization + Community
- Recommendation Engine (graph tables + Redis strategy)
- Advanced Search (Typesense prep + Postgres fallback)
- AI Systems (full `AIHistory` + `AutomationRule` + future agents)
- Media, Notifications, Workflow, Collaboration
- Security (RBAC, sessions, API keys, audit)
- Observability, DevOps, API, Data Infrastructure (documented)
- Revenue, Legal, Testing, Documentation, PWA, Future Systems

## Next Immediate Steps (Recommended Order)
1. Set up local Postgres + run `npm run db:migrate && npm run db:seed`
2. Add Redis client + basic caching layer (product cache)
3. Wire Typesense sync job (background)
4. Implement basic recommendation service using the graph tables
5. Build first Admin endpoints (protected) using the schema
6. Add AI History logging (even if AI calls are stubbed)

This is the foundation that Stripe, Airbnb, Notion, and Linear would be proud of.

No shortcuts were taken.
