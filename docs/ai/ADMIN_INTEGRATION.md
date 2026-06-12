# Admin Integration (APIs Only — UI Frozen)

New safe endpoints:
- POST /api/ai/tasks — Submit work to any agent
- GET /api/ai/tasks — List agents + capabilities
- GET /api/ai/prompts — Full prompt library with search
- GET /api/ai/analytics — Cost, usage, performance

The existing frozen Admin "AI Workspace" section can now call these endpoints to:
- Trigger agents
- Browse the prompt library
- See execution history and costs
- Monitor queue depth and health

All heavy agent logic lives in `lib/ai/`.
