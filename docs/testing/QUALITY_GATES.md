# Quality Gates

Every change must pass:

1. Lint + Type + Unit + Integration (with coverage)
2. API + Workflow contracts
3. E2E smoke on frozen critical paths
4. Performance budgets (Lighthouse + k6)
5. Accessibility (WCAG AAA via axe + manual)
6. Visual regression on key components
7. Security (audit + dependency review)
8. Chaos/DR smoke where applicable

Failure = no deploy.
