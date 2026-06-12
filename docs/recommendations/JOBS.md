# Recommendation Background Jobs

## Scheduled Jobs
- `refreshTrendingRecommendations()` — every 4 hours
- `fullGraphRefresh()` — nightly at 03:30
- `refreshSeasonalRecommendations()` — on season change + monthly

## Event-Driven
- On user saves/favorites → invalidate that user's personalization cache
- On product publish → trigger delta graph update for that product

## Running Manually
```bash
npx tsx scripts/recommendations/refreshAll.ts
```

## Production
Use Inngest, BullMQ, or Temporal for reliable, observable job execution with retries and monitoring.
