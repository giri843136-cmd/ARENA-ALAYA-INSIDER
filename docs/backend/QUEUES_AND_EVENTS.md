# Queues & Events

All long-running or side-effect work is asynchronous:

- AI tasks → ai queue
- Recommendation refreshes → recommendations queue
- Search sync → search-sync queue
- Email → email queue
- Publishing workflows → publishing queue

Events are published on Redis and can be consumed by workers or other services.

Core events:
- product.published
- article.published
- price.changed
- ai.task.completed
- search.updated
- recommendation.updated

This decouples the frontend/admin from heavy backend work.
