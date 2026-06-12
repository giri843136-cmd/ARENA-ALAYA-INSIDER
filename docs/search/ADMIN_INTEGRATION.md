# Search Intelligence — Admin Integration

The existing frozen admin page at `/admin/search` can now be enhanced with live data from these APIs:

## Available Endpoints (new)
- `GET /api/search?q=...` — Main hybrid search
- `GET /api/search/autocomplete?q=...` — Fast suggestions
- `GET /api/search/analytics` — Popular, recent, no-result queries

## Recommended Admin Enhancements (future, without touching frozen UI)
- Call `/api/search/analytics` to power "No Result Queries" and "Popular Searches" widgets
- Use autocomplete in global command palette (already excellent)
- Add "Reindex Now" button that calls a protected reindex endpoint

## Synonym / Weight / Pinned Management
These are advanced Typesense features. Store rules in Postgres `Setting` or dedicated tables, then apply via Typesense overrides API.

Current foundation gives the admin team:
- Real-time visibility into what users are searching for
- No-result recovery queue
- Ability to trigger reindexes
- Extremely fast underlying search for the public site
