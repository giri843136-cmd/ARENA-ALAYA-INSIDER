# Status & Health Systems

## Public Status Page
- https://status.alayainsider.com (hosted on statuspage.io or similar)
- Components: Website, Search, Recommendations, AI Features, Affiliate Links, Email Notifications.
- Historical incidents + maintenance notices.

## Internal Health Dashboard
- Frozen admin gains new "Global Operations" section (via existing frozen layout) consuming:
  - /api/ops/global-status (new endpoint)
  - Per-region health
  - Queue depths
  - AI provider health + cost burn rate
  - Regional latency heatmaps
  - Error budget remaining

## Incident Timeline
All incidents automatically logged with timeline, impact, resolution, and post-mortem link.

## API
New safe endpoint: GET /api/ops/global-status
Returns aggregated health across regions + systems for dashboards and on-call.
