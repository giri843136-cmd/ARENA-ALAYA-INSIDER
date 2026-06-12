# ALAYA INSIDER — Analytics + Revenue + BI Architecture (Phase 10)

## Philosophy
Analytics is a **decision engine**, not a set of charts. Every metric should drive an action (refresh content, fix link, change affiliate network, trigger AI, etc.).

## Layers
1. **Event Collection** — Central tracker that never blocks user experience.
2. **Real-time Layer** — Redis for live signals (popular queries, revenue ticker, queue health).
3. **Analytical Layer** — Postgres (partitioned) + materialized views today.
4. **Warehouse Future** — ClickHouse for OLAP, BigQuery/Snowflake for heavy BI.
5. **Intelligence Services** — Revenue, Affiliate, AI, Search, Recommendation.
6. **Forecasting + Alerts** — Proactive, not reactive.
7. **Dashboards** — Consumed by the frozen admin via safe APIs.

## Attribution & Identity
- Session + user resolution
- Multi-touch attribution models (configurable)
- 13-month raw event retention, 7-year aggregations

## Key Integration Points
- Listens to the main event bus from Phase 9
- Feeds recommendations and search intelligence (closed loops)
- Powers AI cost control and content refresh automation
- Full audit trail for finance/compliance
