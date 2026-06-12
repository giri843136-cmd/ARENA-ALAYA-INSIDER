# CI/CD & Deployment - ALAYA INSIDER

## Pipeline (GitHub Actions)
- Lint + Typecheck
- Unit + Integration Tests
- Security Scans (npm audit + dependency review)
- Build
- Preview Deploy (on PRs via Vercel)
- Staging Deploy (on develop)
- Production Canary Deploy (on main) → Smoke Tests → Automatic Rollback on failure

## Deployment Strategy
- **Preview**: Every PR gets an isolated Vercel preview
- **Staging**: Continuous deployment from `develop`
- **Production**: Canary (10-25%) from `main`, manual or automated promotion after health checks
- **Rollback**: Instant via Vercel (or script). Automatic on failed smoke tests.

## Feature Flags
Use Vercel Edge Config or a simple Postgres table for gradual rollouts and instant kill switches.

## Release Windows
Production deploys are allowed 10am–6pm UTC on weekdays (adjust as team grows). Emergency deploys always allowed with on-call approval.
