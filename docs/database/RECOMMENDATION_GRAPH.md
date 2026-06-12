# ALAYA INSIDER — Recommendation Graph Strategy

## Two-Layer Approach (Postgres + Redis)

### Layer 1: Postgres (Source of Truth + Explainability)
Tables:
- `RelatedProduct` (from/to + type + score + source)
- `RelatedArticle`
- `RelatedProductArticle`
- `EntityRelation` (knowledge graph)

Types we support:
- similar (content + attribute based)
- co-viewed
- co-purchased / frequently bought together
- editorial (hand-curated)
- seasonal
- brand-affinity
- trending

### Layer 2: Redis (Fast Traversal)
- Sorted sets per product: `rec:prod:{id}:{type}`
- ZADD with scores
- Fast `ZREVRANGE` for "Top 12 similar products"

## Computation Strategies
1. **Editorial** — manually set via admin (highest trust)
2. **Rule-based** — same universe + similar tags + price band
3. **Behavior** — co-viewed / co-purchased (from analytics)
4. **Graph embeddings** (future) — once we have vectors
5. **AI-generated** — Content Architect + Recommendation AI will propose candidates

## Refresh Cadence
- Editorial: immediate
- Behavior-based: nightly + on significant events
- Seasonal: on season change

## Personalization Overlay
Combine graph recommendations with user history:
- Affinity score = graph score × user_interest_match
- "Because you viewed X" explanations

This is the same pattern used by the best recommendation systems at scale.
