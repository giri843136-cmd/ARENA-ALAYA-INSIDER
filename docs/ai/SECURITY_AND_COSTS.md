# Security & Cost Controls

- Per-agent rate limits
- Max cost per task (configurable)
- Provider isolation
- All executions audited in AIHistory table
- Secrets never exposed to agents (router handles keys)
- Memory is scoped so agents cannot leak cross-user data

Cost tracking is first-class. Every task records tokens and USD cost.
