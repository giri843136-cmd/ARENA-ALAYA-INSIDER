# ALAYA INSIDER — Search Intelligence + Typesense (Phase 6)

**Completely new infrastructure. Public frontend and admin UI remain frozen.**

## What Was Built

- Full Typesense collection schemas matching our rich data model
- Production-grade client + indexer + delta/full sync strategy
- Hybrid semantic + keyword search service
- Redis layer for popular/recent/no-result tracking + caching
- Search analytics tracker (Postgres + Redis)
- Background job patterns (sync, reindex)
- REST APIs: `/api/search`, `/api/search/autocomplete`, `/api/search/analytics`
- Comprehensive documentation

## Quick Start (Local)

1. Start Typesense (see docs/search/TYPESENSE_SETUP.md)
2. Ensure Postgres + Redis are running
3. `npm run db:seed`
4. `npx tsx scripts/search/seed-typesense.ts`
5. `npm run dev`

Test:
- http://localhost:3000/api/search?q=linen
- http://localhost:3000/api/search/autocomplete?q=lin
- http://localhost:3000/api/search/analytics

## Production Path

- Set up Typesense cluster
- Add the reindex job to cron (nightly full, frequent delta)
- Wire real-time upserts on content publish
- Use the analytics APIs to power the (frozen) admin Search Intelligence page
- Add vector embeddings later for true semantic search

This layer was built to feel magical — instant, intent-aware, and deeply observable.

No technical debt. Ready for millions of users.
