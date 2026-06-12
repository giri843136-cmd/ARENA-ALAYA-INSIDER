# ALAYA INSIDER — Recommendation Engine Architecture

## Core Philosophy
Recommendations must feel **personal, editorial, contextual, seasonal, serendipitous, and trustworthy**.

We use a **multi-layer graph + scoring engine + personalization** approach used by the best systems at Netflix, Amazon, and Pinterest.

## Layers

1. **Graph Layer** (Prisma + Redis)
   - `RelatedProduct`, `RelatedArticle`, `EntityRelation` (from Phase 4 schema)
   - Behavioral edges computed from activity logs
   - Editorial edges set by humans in admin

2. **Scoring Engine** (`lib/recommendations/services/scoringEngine.ts`)
   - 9 weighted signals (editorial, behavior, popularity, trending, affinity, freshness, seasonality, similarity, search)
   - Business rule boosts
   - Diversification logic

3. **Service Layer** (`recommendationService.ts`)
   - `getProductRecommendations`
   - `getPersonalizedRecommendations` ("For You")
   - `getArticleRecommendations`
   - `getForModule` (for specific UI modules)

4. **Cache Layer** (Redis)
   - Hot "For You" per user
   - Global trending
   - Popular recommendations

5. **Job Layer**
   - Nightly full graph refresh
   - Delta behavioral updates
   - Seasonal / trending refreshes

## Data Flow
Postgres (truth) → Graph Builder → Scoring Engine → Redis Cache → API → (frozen) UI

## Future
- Vector similarity (using the `embedding` field prepared in Phase 4)
- Real-time online learning from clicks
- A/B testing framework for recommendation modules
