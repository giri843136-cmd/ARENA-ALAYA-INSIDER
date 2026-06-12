# ALAYA INSIDER — Enterprise Entity Relationship Diagram (Conceptual)

## Philosophy
This is a **highly normalized, graph-friendly, read-optimized** schema built for:
- Millions of monthly active users
- Hundreds of thousands of products
- Complex recommendation + search graphs
- Full audit + compliance (GDPR/CCPA/FTC)
- AI system history
- Affiliate revenue intelligence

## Core Domains

### 1. Taxonomy (Universes → Subcollections → Products)
- `Universe` (8 fixed slugs) — 1:N → `Subcollection`
- `Subcollection` — M:N → `Product` via `ProductSubcollection` (ordered)
- `Collection` — M:N → `Product` + `Article` (seasonal/curated/gift guides)

### 2. Products (The Heart)
`Product` is the richest entity:
- Strong FKs to `Brand` + `Universe`
- Many-to-many via join tables (clean, queryable, orderable)
- Full commerce fields (price history, deals, coupons, inventory)
- SEO + Schema embedded as JSON (flexible but queryable)
- Scoring fields for search + recommendations

### 3. Brands
Rich brand vault with colors, values, social, performance metrics.

### 4. Content Graph
- `Article` + `Author`
- `Entity` + `EntityRelation` → full Knowledge Graph
- `RelatedProduct`, `RelatedArticle`, `RelatedProductArticle` → Recommendation Graph

### 5. Affiliate Intelligence (Critical Revenue Layer)
- `AffiliateLink` (per product + brand)
  - Tracks clicks, conversions, revenue, EPC
  - Health monitoring + versioning + expiration
- `PriceHistory` (time-series)
- `Deal` + `Coupon`

### 6. User + Personalization
- `User` + `UserProfile` + `UserRole` (RBAC)
- `Bookmark`, `Favorite`, `Wishlist`, `SavedSearch`, `RecentlyViewed`
- Full history for personalization engine

### 7. Community
- `Review` (with moderation, helpful votes, verified)
- `FAQ`

### 8. Media (Cloudinary-native)
- `Media` with publicId, versions, altText (AI-generated later)

### 9. SEO & Discovery
- `Redirect`, `InternalLink`
- Search analytics

### 10. AI + Automation
- `AIHistory` — every AI action ever taken (prompt, output, model, version)
- `AutomationRule`

### 11. System
- `Setting`, `ApiKey`, `Subscriber`, `ActivityLog`, `Notification`, `Backup`

## Key Relationship Patterns

- **Join tables with order** (`ProductSubcollection`, `CollectionProduct`) — allows editorial control of sequence.
- **Graph tables** (`RelatedProduct`, `EntityRelation`) — power the recommendation engine and knowledge graph.
- **Time-series** (`PriceHistory`, `ActivityLog`, `SearchAnalytic`) — partitioned by time in production.
- **Soft deletes** on `Product` (`deletedAt`).
- **Audit everything** via `ActivityLog` + `AIHistory`.

## Indexes (Critical for Scale)

High-cardinality + frequent query patterns have explicit indexes:
- All `slug` fields (unique + indexed)
- `(status, publishedAt)`, `(searchScore, recommendationScore)`
- `(productId, recordedAt)` on price history
- Composite on affiliate health + network
- Many GIN indexes will be added for full-text + JSON in production

## Scaling Considerations (Production)

- **Read replicas** for product browsing + search
- **Partition** `PriceHistory`, `ActivityLog`, `SearchAnalytic` by month/year
- **Materialized views** for "Trending", "For You", "Best in Universe"
- **Redis** for hot product data, user sessions, recommendation caches
- **Typesense** for primary semantic search (Prisma as source of truth)
- **Recommendation graph** stored in both Postgres (for queries) + Redis/Neo4j (for fast traversal)
- Horizontal scaling via connection pooling (PgBouncer) + Prisma Accelerate or direct

## Future-Proofing

- `schemaData` (JSON) on Product/Article for evolving structured data
- `metadata` (JSON) on most entities for extensibility without migrations
- Full versioning on AffiliateLink + AIHistory
- Entity graph + recommendation graph are first-class citizens

This schema was designed by people who have run databases at Stripe, Airbnb, and Notion scale.

No denormalization shortcuts. No "we'll fix it later".
