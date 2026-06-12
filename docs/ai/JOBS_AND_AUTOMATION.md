# Background Jobs & Automation

Queue: Redis list-based task queue

Workers: Simple polling workers (can be scaled horizontally)

Common automated flows:
- Nightly Content Refresh for high-traffic articles
- Weekly Trend Radar scan + notification to editors
- Link health audit + broken link alerts
- Recommendation graph refresh triggered by AI
- SEO Strategist run on all new products

Workflows are defined in code or (future) via admin UI and can chain multiple agents with conditions and retries.
