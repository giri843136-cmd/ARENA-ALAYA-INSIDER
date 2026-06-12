# Recovery & Disaster Recovery

- Postgres: daily backups + PITR
- Redis: AOF + RDB
- Typesense: snapshots
- All queues have dead-letter handling
- AI tasks are idempotent where possible
- Full event log allows replay
- Documented runbooks for major incident types (DB down, search down, AI provider outage)
