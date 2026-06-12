# Capacity Planning & Cost Optimization

## Forecasting Models
- Traffic: 3-month moving average + seasonality + known campaigns.
- AI: Per-agent historical usage * projected content volume + new features.
- Database: Growth in events + active users.
- Search: Document count + query volume.

## Budgets (Example Starting Targets)
- Monthly Vercel + Edge: $X
- Database: $Y
- Redis + Typesense: $Z
- AI providers: $A (biggest lever — monitored daily)
- CDN / Media: $B

## Optimization Levers
- Aggressive caching (Redis + Vercel Edge + ISR)
- Regional AI routing to cheapest provider
- Prompt caching and smaller models for simple agents
- Image optimization (AVIF + Cloudinary transformations)
- Queue backpressure to avoid over-provisioning workers
- Quarterly "cost of quality" review

Alerts at 70% and 90% of monthly budget.
