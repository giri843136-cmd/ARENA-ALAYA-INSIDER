# Voice + Visual + Multimodal Search (Phase 14)

## Voice Search
- Entry points: Floating mic in search, dedicated voice screen, widgets, Siri Shortcuts / Google Assistant (future).
- Pipeline:
  1. Speech-to-text (device or server — on-device preferred for privacy).
  2. Intent + entity extraction using the existing Knowledge Graph + LLM (via AI Workspace agents).
  3. Query rewriting + expansion using user's history and current context.
  4. Hybrid search (text + semantic) against the main search index.
  5. Natural language response + result cards.
- Follow-up questions supported via conversation state (tied to AI Shopping Assistant).
- Analytics: Intent accuracy, abandonment, conversion from voice.

## Visual Search
- Entry points: Camera button in search, share extension from Photos, "Search with image" in product pages.
- Pipeline:
  1. Image upload or selection.
  2. On-device or server-side feature extraction (embeddings via CLIP-like or custom fine-tuned model).
  3. Similarity search in a dedicated visual embedding index (or hybrid with existing Typesense + vector extension).
  4. Post-processing: color palette extraction, style classification, brand detection, object recognition.
  5. Result ranking combining visual similarity + editorial score + user affinity.
- Privacy: Option to process on-device where possible. Clear consent for cloud processing.

## Multimodal Search
- Unified search bar that accepts text, voice, or image (or all at once).
- The system fuses signals:
  - Text intent
  - Visual features
  - Voice entities
  - User context / history
  - Knowledge + Recommendation + Entity graphs
- Output is a rich, explained result set ("Here are similar linen pieces in warm neutrals that match the vase in your photo...").

## AI Shopping Assistant (Conversational Layer)
- Persistent or session-based conversations.
- Capabilities:
  - Guided discovery ("I'm looking for a gift under $150 for my sister who loves quiet luxury")
  - Comparison help
  - Gift finder with constraints
  - Brand deep-dives
  - "What's trending in Sanctuary right now?"
  - Follow-ups that maintain context
- Backed by the existing AI Workspace agents (Content Architect, Trend Radar, Recommendation AI, etc.) + new conversation orchestration.
- Memory: Short-term (current session) + long-term (user preferences, past purchases, saved searches) via the memory system from Phase 8.
- Voice + text + image input in the same conversation thread.

## Technical Foundations
- Embeddings stored alongside existing data (extend product/article models with `visualEmbedding`, `textEmbedding`).
- New search services in `api/search/{voice,visual,multimodal}`.
- Rate limiting, cost controls, and graceful fallbacks (text-only when multimodal fails).
- Analytics tied into the central warehouse.

This is where ALAYA starts to feel like magic — discovery that meets the user where they are (talking, pointing camera, typing).
