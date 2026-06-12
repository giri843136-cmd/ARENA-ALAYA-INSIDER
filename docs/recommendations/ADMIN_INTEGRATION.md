# Admin Integration (APIs Only — UI Frozen)

New safe endpoints created:
- `GET /api/recommendations/products?productId=xxx`
- `GET /api/recommendations/personalized?userId=xxx`
- `GET /api/recommendations/articles?articleId=xxx`
- `GET /api/recommendations/analytics`

These can be consumed by the existing frozen Admin "Recommendation Engine" page.

Future admin capabilities (without touching UI now):
- Manual edge creation / editing in Prisma
- "Pin as editorial" buttons
- Override scores
- A/B test module configuration
- View graph visualization (would use the Relationship Explorer concept)

All heavy lifting happens in the new lib/recommendations layer.
