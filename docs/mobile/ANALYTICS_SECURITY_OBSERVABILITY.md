# Mobile, Marketplace, Voice/Visual & SDK — Analytics, Security, Observability

## Analytics
- All mobile events flow into the central analytics system (Phase 10) with `source: "mobile-ios" | "mobile-android" | "marketplace" | "voice" | "visual" | "sdk-partner-xxx"`.
- New event types: `mobile.app_open`, `voice.query`, `visual.search`, `marketplace.listing_view`, `sdk.api_call`, `ai_assistant.message`, `offline.download`, etc.
- Marketplace-specific: partner performance, submission funnel, approval time, commission attribution.
- Voice/Visual: intent success rate, abandonment, conversion lift, query reformulation rate.
- SDK usage: per-partner rate, error rates, popular endpoints.

## Security
- Mobile: App attestation (iOS DeviceCheck / Android Play Integrity), certificate pinning, secure storage for tokens.
- Marketplace & SDKs: Scoped API keys, signed requests, partner isolation, strict rate limits per key/partner.
- Voice/Visual: Consent for processing, on-device options where feasible, data retention aligned with overall policies.
- All new surfaces inherit existing RBAC + audit logging from Phase 9.

## Observability
- Mobile crashes, ANRs, performance via Sentry + custom.
- API latency, error rates, and throughput per new surface (mobile, marketplace, voice, visual, multimodal, sdk).
- AI assistant: conversation length, resolution rate, escalation to human, cost per session.
- Marketplace: submission volume, approval rate, partner health.
- End-to-end tracing across web ↔ mobile ↔ SDK ↔ backend using OpenTelemetry (building on Phase 11/13).

Alerts for new surfaces are added to the global observability system.
