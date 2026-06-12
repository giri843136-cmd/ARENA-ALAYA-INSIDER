# Queue & AI Global Infrastructure

## BullMQ / Workers
- Workers deployed in every region.
- Primary region handles heavy AI jobs (Content Architect, SEO Strategist).
- Regional workers handle lightweight jobs (email, notifications, search sync).
- Cross-region job routing for cost (run expensive AI in cheapest/low-latency provider region).
- Dead-letter queues + retry policies with exponential backoff + jitter.
- Backpressure: Pause queues when Redis memory > 80% or AI provider error rate > 5%.

## AI Provider Strategy
- Primary: Anthropic (Claude) — highest quality for editorial.
- Fallback 1: OpenAI (GPT-4o).
- Fallback 2: Gemini.
- Regional routing + automatic failover based on latency + error rate + cost.
- Prompt caching at edge for common agent calls.
- Strict per-agent and global daily token budgets with alerts.

## Monitoring
- Per-region queue depth, processing latency, DLQ size.
- AI: tokens/second, cost/hour, success rate, provider latency per region.
- Automatic scaling of workers based on queue length.
