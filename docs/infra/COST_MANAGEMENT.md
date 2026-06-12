# Cost Management

Tracked monthly:
- Vercel (compute + bandwidth + edge functions)
- Neon / Postgres (compute + storage)
- Redis / Upstash
- Typesense (cloud or self-hosted)
- Cloudinary
- Resend
- AI providers (Anthropic primary cost driver)
- Sentry, monitoring tools

Alerts fire when monthly run-rate exceeds budget by 15%.

Optimization loops:
- AI cost per task trending
- Image optimization (Cloudinary)
- Cache hit rates (Redis + Vercel Edge)
- Queue worker efficiency

Quarterly cost review with engineering + finance.
