# Feature Flags & Release Management

Recommended approach:
- Vercel Edge Config (fast, edge-native)
- Or a simple `feature_flags` table in Postgres with cache invalidation

Use flags for:
- Gradual rollout of new recommendation algorithms
- AI agent experiments
- New admin features
- Dark launches of major UI changes (when we eventually unfreeze)

Flags should be readable from both server and edge functions.
