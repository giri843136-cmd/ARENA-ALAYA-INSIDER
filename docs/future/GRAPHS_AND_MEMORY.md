# Graphs in Phase 15: Taste Graph, Lifestyle Graph, Memory Graph

## Existing Foundation (Phases 1-14)
- Entity Graph
- Knowledge Graph
- Recommendation Graph
- Search Graph
- Content Graph
- Brand/Collection/Universe Graphs

## New Personal Graphs (Phase 15)

### Taste Graph
A deeply personal, evolving graph for each user:
- Nodes: Products, brands, materials, colors, styles, spaces, rituals, articles the user has engaged with.
- Edges: "Loves because...", "Reminds me of...", "Better than X because...", "Would pair beautifully with Y".
- Strength and recency signals.
- Evolution over time (taste changes are captured, not overwritten).

Used for:
- Hyper-personalized recommendations
- AI Concierge reasoning
- "Your taste twin" simulations
- Long-term collection planning

### Lifestyle Graph
Broader context:
- Home(s), rooms, current collections
- Daily/seasonal rituals
- Important relationships and gifting patterns
- Life events and transitions
- Goals ("building a calmer home", "investing in fewer, better things")
- Seasonality and mood patterns

### Memory Graph
The substrate for the Personal AI Concierge:
- Every conversation
- Explicit statements ("I hate shiny finishes")
- Implicit signals (lingering on certain images, repeated views)
- Outcomes of previous autonomous actions
- Corrections and feedback

These graphs are private, versioned, and queryable by the multi-agent system.

## Technical Implementation
- Built on top of existing graph infrastructure (Phase 4 + Phase 7 + Phase 8 memory).
- Heavy use of vector embeddings + graph traversal.
- Incremental updates from every user interaction (mobile, web, voice, visual, SDK).
- Periodic consolidation and summarization for long-term coherence.
- Privacy: Graphs live in user-controlled encrypted storage with strict access controls.
