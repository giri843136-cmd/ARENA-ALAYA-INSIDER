# ALAYA INSIDER — Analytics + Revenue Intelligence + BI (Phase 10)

**New infrastructure only. Every previous phase (frontend, admin UI, search, recommendations, AI, backend platform) remains 100% frozen.**

## What Was Built

A complete, decision-oriented analytics and business intelligence platform at the level of Stripe, Netflix, Airbnb, Amazon, and Amplitude.

### Core Components
- Unified event model and high-fidelity tracker
- Real-time Redis signals + durable Postgres events
- Dedicated intelligence services (Revenue, Affiliate, AI, Search, Recommendations)
- Batch pipelines + content decay detection
- Forecasting (revenue + AI cost)
- Intelligent alerting
- Safe v1 analytics APIs for the frozen admin
- Warehousing strategy (Postgres today, ClickHouse/BigQuery ready)
- Full documentation

## Usage

```bash
# Run daily batch
npx tsx scripts/analytics/daily.ts

# Revenue intelligence
curl "http://localhost:3000/api/analytics/revenue?days=30"

# Affiliate intelligence
curl "http://localhost:3000/api/analytics/affiliate"

# AI cost & performance
curl "http://localhost:3000/api/analytics/ai"
```

These endpoints (and many more) are designed to power rich dashboards in the existing frozen Admin "Analytics / Revenue / AI" sections without any UI changes.

## Philosophy
Every number exists to answer a question or trigger an action. The system is built to make the editorial and business teams dramatically smarter, faster, and more profitable — while keeping the user experience warm, elegant, and human.
