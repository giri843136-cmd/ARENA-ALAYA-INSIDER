# AI Shopping Assistant (Phase 14)

Conversational layer on top of the existing AI Workspace (Phase 8).

Capabilities:
- Natural, guided discovery
- Maintains short-term + long-term memory (via Phase 8 memory system)
- Can call other agents (Trend Radar, Recommendation AI, Content Architect) as tools
- Supports voice + text + image input in one thread
- Graceful handoff to human editor when needed

Implementation lives in lib/ai-assistant/ and api/ai/assistant (new routes that orchestrate existing agents).

Tone: Warm, knowledgeable, never pushy — exactly like the editorial voice.
