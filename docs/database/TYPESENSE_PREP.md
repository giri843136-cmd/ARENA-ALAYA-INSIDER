# ALAYA INSIDER — Typesense Preparation & Schema

## Why Typesense
- Blazing fast semantic + keyword hybrid search
- Typo tolerance, synonyms, facets, filters — out of the box
- Excellent for "millions of monthly users"
- Self-hostable or cloud

## Collection: `products`

```json
{
  "name": "products",
  "fields": [
    {"name": "id", "type": "string"},
    {"name": "slug", "type": "string"},
    {"name": "name", "type": "string"},
    {"name": "description", "type": "string"},
    {"name": "brandName", "type": "string", "facet": true},
    {"name": "universe", "type": "string", "facet": true},
    {"name": "price", "type": "float", "facet": true},
    {"name": "rating", "type": "float", "facet": true},
    {"name": "tags", "type": "string[]", "facet": true},
    {"name": "searchScore", "type": "float"},
    {"name": "recommendationScore", "type": "float"},
    {"name": "image", "type": "string"},
    {"name": "createdAt", "type": "int64"}
  ],
  "default_sorting_field": "searchScore"
}
```

## Collection: `articles`
Similar structure + `readingTime`, `authorName`, `universe`

## Sync Strategy (Source of Truth = Postgres)
- Use a background job (every 5–15 min or on publish) that:
  1. Fetches changed products/articles since last sync
  2. Upserts into Typesense
  3. Handles deletes (soft deletes become filtered out)

## Future Enhancements
- Embeddings field (for true semantic search once we have vector embeddings)
- Curated "pinned" results via overrides
- Query analytics → feed back into ranking

## Fallback
Postgres full-text + our internal scoring always available as fallback.
