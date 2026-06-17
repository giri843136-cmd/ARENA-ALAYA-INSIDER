# ALAYA INSIDER — AI Workspace (Phase 8)

**New infrastructure layer only. All previous phases (frontend, admin UI, search, recommendations) remain completely frozen.**

## What Was Built

A full "AI Operating System" for a premium editorial platform — not a chatbot.

### Highlights
- 30+ specialized agents (Content Architect, SEO Strategist, Trend Radar, Brand Voice Guardian, etc.)
- Pluggable provider architecture with intelligent routing and fallbacks (Anthropic primary)
- Multi-scope memory system (global + agent + user + task + workflow)
- Rich, versioned Prompt Library with variables
- Redis-backed task queue + background workers
- Full execution history, cost tracking, and analytics
- Knowledge graph awareness (all previous graphs are inputs)
- Safe, new API surface under /api/ai/*
- Comprehensive documentation

### Philosophy
The AI Workspace exists to amplify human taste and editorial judgment, not replace it. Every agent is heavily biased toward warmth, specificity, and long-term quality.

## Usage

```bash
# Seed prompts (optional)
npx tsx scripts/ai/seed-prompts.ts

# Start a worker (in a separate terminal)
npx tsx scripts/ai/run-worker.ts

# Submit work via API
curl -X POST http://localhost:3000/api/ai/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "agentType": "content_architect",
    "input": { "topic": "The rise of hand-thrown ceramics", "universe": "sanctuary" },
    "userId": "editor-1"
  }'
```

## Next

These APIs are ready to power the (frozen) Admin AI Workspace dashboard, background automations, and future public-facing AI features.

The architecture is designed to be extended with new agents, better memory, vector embeddings, and multi-step workflows without ever touching existing UI.
