# Personal AI Concierge

The heart of Phase 15.

## Core Capabilities

- **Persistent Memory**: Never forgets. Remembers every conversation, every saved item, every "I love this because..." moment across years.
- **Taste Graph**: A living, evolving representation of what the user loves, why they love it, and how their taste evolves.
- **Lifestyle Graph**: Broader context — home, rituals, relationships, seasons, life events, goals.
- **Intent Prediction**: Anticipates needs before the user articulates them.
- **Mood & Context Awareness**: Adapts tone and suggestions based on time of day, season, recent activity, or explicit mood.
- **Long-term Planning**: Helps build collections over months/years, plans seasonal refreshes, tracks life events (new home, wedding, baby, etc.).
- **Session Continuity**: Conversations can span days or weeks. The concierge remembers where you left off.

## Architecture

The Concierge is not a single model. It is an orchestrator that:

1. Maintains the user's personal graphs (Taste + Lifestyle + Memory).
2. Routes queries to specialized agents (Research, Shopping, Editorial, Trend, Price, etc.).
3. Maintains conversation state and long-term memory.
4. Proposes actions to the user (or executes low-risk ones autonomously).
5. Explains its reasoning in beautiful, human language.

It sits on top of the existing AI Workspace (Phase 8), the graphs built across phases, the memory system, and the global infrastructure.

## Interaction Modalities

- Text (web + mobile)
- Voice (mobile + future spatial)
- Vision (photo of room, object, outfit → understanding + suggestions)
- Proactive (gentle notifications: "The linen you loved last year is back in a new color that matches your current bedroom palette")

## Privacy & Trust

- All personal graphs are encrypted and user-owned.
- User can inspect, edit, or delete any part of their memory/taste profile at any time.
- Strong explainability: "I recommended this because you loved X in 2024 for reason Y, and this shares similar material qualities while being more durable."
- No training on user data without explicit consent.

This is the layer that makes ALAYA feel like a true companion rather than a tool.
