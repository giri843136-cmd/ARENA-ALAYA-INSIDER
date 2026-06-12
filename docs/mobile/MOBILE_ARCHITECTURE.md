# ALAYA INSIDER — Mobile Applications Architecture (Phase 14)

## Philosophy
ALAYA INSIDER becomes an ecosystem. The mobile experience should feel magical, personal, and deeply integrated — like Apple, Pinterest, and Airbnb combined.

Core principles:
- Offline-first where it matters (reading, saved collections, recommendations cache)
- Delightful micro-interactions (Apple-level polish)
- Deep platform integration (widgets, Live Activities, share extensions, universal links)
- Seamless continuity with web (same data, same voice, same recommendations)
- Multimodal discovery (text + voice + visual)

## Tech Stack
- **Primary**: React Native + Expo (for velocity + OTA updates)
- **Native modules** only where necessary (camera for visual search, push, widgets)
- **State**: Zustand or Jotai + React Query / TanStack Query for offline sync
- **Navigation**: React Navigation 7 (or Expo Router for file-based)
- **Offline**: WatermelonDB or SQLite + sync engine with conflict resolution
- **Push**: Expo Notifications + native (FCM / APNs)
- **Analytics**: PostHog or Amplitude + custom mobile events feeding the central analytics warehouse (Phase 10)
- **Crash/Perf**: Sentry + Expo Updates

## Key Experiences
- Home: The Edit, Universes, Personalized "For You"
- Discovery: Unified search (text + voice + camera)
- Reading: Full article experience with offline download, reading progress, highlights
- Collections & Marketplace: Browse partner brands, save to personal collections
- AI Assistant: Floating or dedicated conversational shopping/discovery companion
- Profile: Saved items, reading history, preferences, notifications

## Offline Strategy
- Cache last 50 viewed products + articles
- Downloadable "Reading Packs" per universe or collection
- Recommendations and search results cached with TTL
- Background sync when online (using Expo Task Manager)

## Deep Linking & Universal Links
- alayainsider://product/{slug}
- alayainsider://article/{slug}
- alayainsider://universe/{slug}
- Universal links: https://alayainsider.com/product/... (handled by both web and app)

## Performance & Polish Targets
- Cold start < 1.2s
- Time to first meaningful paint < 800ms
- 60fps scrolling everywhere
- Haptic feedback on key actions (Apple standard)
- Full VoiceOver / TalkBack support + Dynamic Type

This mobile experience is designed to feel like a native citizen of the user's phone, not a website in a wrapper.
