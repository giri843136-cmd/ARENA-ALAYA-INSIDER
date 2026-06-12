# API v1

Base URL: /api/v1

## Products
- GET /api/v1/products — paginated, filterable
- POST /api/v1/products — create (requires auth + permission)

## Articles, Brands, Search, AI, Recommendations follow the same pattern.

## Webhooks
- /api/v1/webhooks/*

All APIs are:
- Versioned
- Rate limited
- Audited
- Return consistent error shapes
- Support pagination, filtering, sorting

Full OpenAPI spec should be generated from code in production.
