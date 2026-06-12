# Chaos Engineering & Disaster Recovery Validation

Chaos tests simulate real failures (DB down, AI provider outage, queue backpressure, region failure).

They validate:
- Graceful degradation
- Automatic fallback to cache / previous recommendations / editorial pins
- Proper health signaling
- No data loss on recovery

Disaster recovery tests:
- PITR restore
- Event replay
- Full platform smoke after restore
- Runbook validation (quarterly drills)

Results are stored and reviewed in post-mortems.
