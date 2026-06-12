# Memory System

Scopes:
- global: platform-wide knowledge (trends, brand guidelines, etc.)
- agent: what this specific agent has learned recently
- user: personalization signals for a particular editor
- task: context for a single long-running workflow
- workflow: state across multi-step automations

Memory is injected automatically into prompts when relevant.

Stored in Redis for speed + Postgres (via AIHistory) for durability and audit.
