# Multi-Agent System

ALAYA INSIDER's intelligence is no longer a single AI. It is a society of specialized agents that collaborate under the coordination of the Personal AI Concierge.

## Core Agents

- **Planner Agent**: Breaks down complex goals ("Help me refresh my entire bedroom for under $800 while staying true to my current Sanctuary aesthetic") into executable steps.
- **Research Agent**: Deep dives into brands, materials, trends, comparisons. Uses web/tools + internal knowledge graphs.
- **Shopping Agent**: Finds specific products, tracks prices, monitors availability, negotiates (where APIs allow), builds carts.
- **Editorial Agent**: Maintains voice and quality. Writes or refines descriptions, comparisons, stories. Ensures nothing feels generic.
- **Trend Agent**: Monitors emerging signals across search, social, sales, visual trends. Surfaces opportunities early.
- **Price Agent**: Tracks deals, historical pricing, predicts drops, calculates true value.
- **Search Agent**: Multimodal retrieval specialist (text/voice/visual).
- **Recommendation Agent**: Personalization and graph-based discovery.
- **Personalization Agent**: Maintains and evolves the Taste + Lifestyle Graphs.
- **Memory Agent**: Long-term memory management, summarization, retrieval for the Concierge.
- **Quality Agent**: Fact-checking, taste alignment, brand values alignment, safety.
- **Coordinator Agent**: The "brain" that routes, sequences, and synthesizes output from other agents. Decides when to act autonomously vs. ask for human approval.

## Coordination Patterns
- Hierarchical (Concierge → Coordinator → Specialists)
- Peer-to-peer collaboration between agents
- Tool use (existing Phase 8 agents, search, recommendation, vision models, external APIs)
- Debate / critique loops for high-stakes decisions

## Human Approval Layer (Critical)
Not everything is autonomous. The system is designed with clear tiers:

- **Tier 0 (Fully Autonomous)**: Price tracking, basic research summaries, routine collection updates.
- **Tier 1 (Notify + Auto-Execute if no objection)**: Adding items to "Consider" lists, minor recommendation refinements.
- **Tier 2 (Require Explicit Approval)**: Actual purchases, major collection changes, sharing personal taste profile with partners.
- **Tier 3 (Human + AI Collaboration)**: Gift selection for important people, high-value decisions, anything involving the user's core identity.

The Concierge always explains *why* it wants to do something and what evidence it has.

## Implementation
Agents are implemented as extensions of the Phase 8 AI agents, orchestrated through new coordination logic in `lib/future/agents/`.

They share the same governance, memory, and graph infrastructure.
