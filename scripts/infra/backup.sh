#!/bin/bash
set -e

echo "=== ALAYA INSIDER Backup Script ==="

# Postgres (Neon / Supabase / self-hosted)
echo "Backing up Postgres..."
pg_dump $DATABASE_URL | gzip > "backups/postgres-$(date +%Y%m%d-%H%M%S).sql.gz"

# Redis snapshot (if self-managed)
echo "Triggering Redis snapshot..."
redis-cli BGSAVE

# Typesense snapshot (via API or volume)
echo "Typesense backup should be handled by your Typesense cloud / volume snapshot policy."

echo "Backup complete."
