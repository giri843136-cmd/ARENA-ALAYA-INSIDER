# ALAYA INSIDER — Typesense Setup & Operations

## 1. Local Development
```bash
docker run -p 8108:8108 -v /tmp/typesense-data:/data typesense/typesense:26.0 \
  --data-dir /data --api-key=xyz --enable-cors
```

## 2. Environment
```
TYPESENSE_HOST=...
TYPESENSE_PORT=8108
TYPESENSE_PROTOCOL=http
TYPESENSE_API_KEY=...
```

## 3. Initial Seed
```bash
npm run db:seed          # Prisma first
npx tsx scripts/search/seed-typesense.ts
```

## 4. Production Recommendations
- Run Typesense in cluster mode (3+ nodes)
- Use API keys with scoped permissions
- Enable query analytics in Typesense
- Set up automated snapshots

## 5. Reindex Strategy
- Nightly full reindex (low traffic window)
- Delta sync every 5-15 minutes (via cron or queue)
- Real-time upserts on publish/update (via webhooks or Prisma middleware)

## 6. Monitoring
Health endpoint: `/api/search/health` (create if needed)
Use the admin Search Intelligence page (existing) + new analytics APIs.
