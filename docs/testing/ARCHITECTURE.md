# ALAYA INSIDER — Testing + Quality Engineering Architecture (Phase 12)

## Philosophy
Quality is an architectural concern. Testing prevents fear. Every deployment must increase confidence, not risk.

## Testing Pyramid (Tailored to ALAYA)
- **Base**: Heavy unit + integration for domain logic (scoring, revenue, RBAC, AI agents, search ranking).
- **Middle**: Contract/API, workflow, queue, search, recommendation, AI, analytics validation.
- **Top**: E2E (critical frozen flows only), chaos, disaster recovery, load/stress/soak.

## Key Focus Areas (Because of Previous Phases)
- Recommendation scoring & diversification
- Revenue attribution & forecasting
- AI agent quality, cost, and reliability
- Search relevance + no-result recovery
- Affiliate link health + conversion
- Auth/RBAC enforcement
- Event integrity across the platform
- Performance budgets on frozen UI + APIs

## Tooling
- Vitest (unit, fast feedback, coverage with strict thresholds)
- Playwright (E2E + a11y + visual)
- k6 (load, stress, soak, chaos simulation)
- Storybook + visual regression (Percy/Chromatic)
- Lighthouse CI (budgets)
- MSW for API mocking
- Supertest for API contract tests

## Gates
All PRs and main must pass the Quality Gates workflow before merge/deploy.

Coverage targets are high on critical business logic (95%+ on recommendation, auth, revenue).

Performance, a11y, and security budgets are hard gates.
