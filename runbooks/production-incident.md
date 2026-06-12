# Production Incident Runbook - ALAYA INSIDER

## P0: Site Down
1. Check https://alayainsider.com/api/ops/health
2. Check Vercel status + deployment logs
3. Check Neon/Postgres, Redis, Typesense status pages
4. If database connection issue → scale connections or restart pooler
5. Roll back to previous successful deployment via Vercel dashboard
6. Post-mortem within 24h

## P1: Revenue / Affiliate Impact
1. Check /api/analytics/revenue and /api/analytics/affiliate
2. Verify affiliate link health (Link Auditor)
3. Check for recent price drops or network outages
4. Notify revenue team immediately

## P2: AI Cost Spike
1. Check /api/analytics/ai
2. Identify offending agent or prompt
3. Temporarily disable high-cost agent via feature flag or config
4. Investigate root cause

## General
- Always prefer automatic rollback over manual fixes
- Communicate status in #incidents Slack channel
- Update this runbook after every incident
