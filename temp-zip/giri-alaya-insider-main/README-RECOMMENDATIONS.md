# ALAYA INSIDER — Recommendation Engine (Phase 7)

**New infrastructure only. All previous layers (frontend, admin UI, search) remain frozen.**

## What Was Built

A complete, multi-source, graph-powered recommendation system designed like the best systems at Netflix, Amazon, Pinterest, and Spotify.

### Core Components
- `lib/recommendations/types.ts` — All relationship types, sources, modules, and scoring models
- `lib/recommendations/services/scoringEngine.ts` — Weighted composite scoring + boosts + diversification
- `lib/recommendations/services/graphBuilder.ts` — Queries the rich Prisma graph + behavioral signals
- `lib/recommendations/services/recommendationService.ts` — The main orchestrator (product recs, "For You", article recs, module support)
- `lib/recommendations/redis/recommendationCache.ts` — Hot caching strategy
- `lib/recommendations/jobs/refreshJobs.ts` — Background refresh patterns
- Safe APIs under `/api/recommendations/*`
- Full documentation suite

### Relationship Types Supported
Product→Product, Product→Article, Article→Product, User→Product, Search→Product, Brand→Product, Universe→Product, Collection→Product, Entity graph, and more.

### Recommendation Sources
Editorial, Behavioral, Popularity, Trending, Seasonal, Affinity, Search, Semantic (prepared), AI-assisted (prepared), Hybrid.

### Key Features
- "For You" / personalized using user history (recently viewed, favorites, bookmarks)
- Strong editorial signals
- Behavioral co-view / co-purchase
- Trending + popularity fallbacks
- Composite scoring with tunable weights
- Diversification logic
- Redis caching for speed
- Background job patterns for nightly/delta refreshes
- Full analytics surface
- Ready for vector embeddings

## How to Use

```bash
# Seed data (from previous phases)
npm run db:seed

# Manual full refresh
npx tsx scripts/recommendations/refreshAll.ts

# Test APIs
curl "http://localhost:3000/api/recommendations/products?productId=p1&limit=8"
curl "http://localhost:3000/api/recommendations/personalized?userId=some-user-id"
```

The APIs are designed to be dropped into product pages, journal, command palette, and the (frozen) admin Recommendation Engine dashboard.

## Philosophy
Every recommendation should feel like it was chosen by a thoughtful, well-read friend who knows your taste — not an algorithm trying to sell you something.

This engine is built to deliver on that promise at scale.
