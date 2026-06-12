# ALAYA INSIDER — Partner & Internal SDK Strategy (Phase 14)

## Goals
- Make it trivial for high-quality partners to integrate (products, search, recommendations, AI assistant).
- Provide excellent developer experience with strong typing.
- Enable future mobile apps, partner websites, and embedded experiences without forking the platform.

## SDKs to Ship
1. **@alaya/insider-sdk** (TypeScript) — Already started in Phase 13. Expand heavily.
2. **AlayaInsider** (Swift / Swift Package Manager) — For native iOS apps and SwiftUI.
3. **alaya-insider-sdk** (Kotlin / Maven) — For native Android (Kotlin) and Jetpack Compose.
4. **REST + GraphQL** fallback for any language.

## Core Capabilities (v1)
- Authentication (API keys + scoped tokens)
- Product & Brand lookup + search
- Recommendations (contextual + personalized)
- Search (text, with future voice/visual hooks)
- AI Assistant sessions (conversational)
- Marketplace submission & status
- Analytics events (for partner attribution)
- Webhooks for product updates, order events (future), etc.

## Versioning & DX
- Semantic versioning with clear migration guides.
- Excellent OpenAPI + TypeSpec / GraphQL schema.
- SDKs generated where possible, hand-polished for native feel.
- Developer portal with interactive docs, sample apps, and quickstarts.
- Rate limiting, key management, and usage dashboards (in new Partner Dashboard).

## Security
- Scoped API keys per partner / per integration.
- Signed webhooks.
- Partner isolation (one partner cannot access another's data).
- Audit logs for all SDK usage.

This SDK layer turns ALAYA into a platform that others can build upon while preserving editorial integrity.
