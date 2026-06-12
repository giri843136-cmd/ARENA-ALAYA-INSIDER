# Coverage Strategy

- Global: 85%+ branches/functions
- Critical domains: 95%+
  - lib/recommendations/**
  - lib/analytics/**
  - lib/backend/auth/**
  - lib/ai/agents/** (quality + cost paths)
- AI agents: Focus on prompt output validation + routing/fallback paths rather than pure line coverage.

Uncovered critical paths require explicit justification in PR.
