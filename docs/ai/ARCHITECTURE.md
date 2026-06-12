# ALAYA INSIDER AI Workspace — Architecture

## Core Principle
The AI Workspace is an **operating system for thoughtful editorial work**, not a chatbot.

## Layers

1. **Agents** — Specialized, opinionated experts (Content Architect, SEO Strategist, Trend Radar, etc.)
2. **Providers** — Pluggable LLM routing with fallbacks, cost controls, and retries (Anthropic primary, OpenAI, Gemini, mocks)
3. **Memory** — Multi-scope (global, agent, user, task, workflow) with Redis hot cache + Postgres durability
4. **Prompt Library** — Versioned, categorized, reusable, high-signal templates
5. **Task/Workflow Engine** — Queue, execution, versioning, retries, parent/child tasks
6. **Knowledge Graphs** — All the graphs from previous phases (entity, recommendation, search, etc.) are first-class inputs to agents
7. **Analytics & Observability** — Token, cost, success rate, latency, prompt effectiveness

## Key Design Decisions
- Heavily editorial bias in prompts and scoring
- Strong memory so agents build on each other's work
- Provider abstraction for cost and quality control
- Everything logged and versioned
- Designed to be called from background jobs, admin, or (future) public experiences

## Scaling
- Queue + workers for high volume
- Per-agent rate limits
- Cost budgets per task / per user / per day
- Caching of common agent outputs
- Incremental knowledge graph updates
