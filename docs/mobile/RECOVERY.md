# Recovery Strategy — Phase 14 Surfaces

## Mobile Apps
- Crash / ANR: Sentry + automated alerts. OTA updates via Expo for fast fixes.
- Offline sync conflicts: Last-write-wins with user override UI + audit log.
- Push delivery failures: Fallback to in-app + email.

## Marketplace
- Partner submission or approval stuck: Manual override in admin + notification to partner.
- Commission calculation errors: Re-run from events (Phase 10) with full audit.

## Voice / Visual / Multimodal / AI Assistant
- Provider outage (speech, vision, LLM): Graceful fallback to text search + cached recommendations + clear messaging ("Voice search temporarily unavailable").
- Cost spikes: Automatic throttling + alerts (building on Phase 10 AI analytics).
- Bad outputs: Human review queue + feedback loop into prompt library (Phase 8).

## SDKs
- Rate limit or error: Clear error codes + retry guidance in SDK.
- Breaking change: Major version + migration period + deprecation warnings.

## General
- All new surfaces participate in the global health checks and disaster recovery drills (Phase 13).
- Full event replay capability for marketplace orders, AI conversations, and search events.
- Quarterly chaos tests targeting new surfaces (e.g., "visual search provider down", "marketplace approval queue stalled").
