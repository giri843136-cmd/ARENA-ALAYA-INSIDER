# Disaster Recovery (Phase 13)

## RTO / RPO Targets
- Full platform RTO: 45 minutes
- RPO: 5 minutes (PITR + event replay)
- Search RTO: 15 minutes (regional replica promotion)
- AI RTO: 5 minutes (provider failover)

## Key Runbooks
- Primary region failure → promote secondary + update routing.
- Database primary loss → replica promotion + connection string rotation.
- Typesense cluster loss → restore snapshot + replay.
- AI provider outage → automatic routing to fallback + user-facing graceful degradation (show cached recs + editorial picks).
- Full event bus loss → replay from Postgres audit logs.

## Quarterly Drills
- Full region failover drill (documented results + improvements).
- Database PITR restore to fresh environment.
- End-to-end smoke after restore.

All drills produce updated runbooks and action items.
