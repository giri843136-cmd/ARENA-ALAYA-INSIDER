# Multi-Environment Strategy

- **Local**: Docker Compose (postgres + redis + typesense + app)
- **Preview**: Vercel preview deployments (ephemeral, tied to PR)
- **Development / QA**: Shared Vercel + Neon preview branch or dedicated staging DB
- **Staging**: Production-like data (anonymized), full feature parity
- **Production**: Primary region + read replicas, DR region ready
- **Disaster Recovery**: Secondary region with point-in-time restore capability
- **Sandbox**: Long-lived environment for experiments and new team members

All environments use the same code. Differences come only from environment variables and database connections.
