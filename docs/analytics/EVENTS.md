# Event Model

All important actions emit `AnalyticsEvent`.

Core fields: name, userId, sessionId, entityType, entityId, properties (flexible), revenue, commission, network, timestamp, source.

This single model powers every dashboard, forecast, and alert.

Events are also published to the platform event bus so recommendations, search, and AI can react in real time.
