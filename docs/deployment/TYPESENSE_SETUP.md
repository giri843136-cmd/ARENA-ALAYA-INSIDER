# ALAYA INSIDER — Typesense Production Setup

## Supported
- Typesense Cloud (recommended)
- Self-hosted

## Cloud
1. cloud.typesense.org
2. Create cluster → copy host/port=443/protocol=https/api-key.
3. Set TYPESENSE_* vars.

## Bootstrap
```bash
npx tsx scripts/search/bootstrap-typesense.ts
```

## Features
Autocomplete, facets, delta sync via BullMQ, full reindex, health checks.

## Backups
Cloud has snapshots. Self-hosted: volume backup.

## Commands
Health: `curl .../api/search/health` (when exposed).