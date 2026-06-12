# Security Operations

- Secret rotation: 90-day cycle for most keys, 30-day for high-privilege
- Dependency scanning on every PR + daily
- Container / image scanning (when using Docker)
- CSP + WAF rules via Vercel + Cloudflare (if fronting)
- Rate limiting at edge + application layer
- Full audit logs for all privileged actions (via ActivityLog + Sentry)
- Bot protection and abuse detection

Compliance readiness: SOC2 / GDPR path documented. Data residency controls via regional routing.
