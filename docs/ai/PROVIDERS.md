# Provider Architecture

Primary: Anthropic Claude 3.5 Sonnet (highest quality for editorial)

Fallbacks: OpenAI GPT-4o, Gemini, then high-quality mock

Features:
- Automatic fallback on failure or cost overrun
- Per-provider cost tracking
- Model/version pinning per agent
- Easy to add new providers

All calls go through the central router with retry logic.
