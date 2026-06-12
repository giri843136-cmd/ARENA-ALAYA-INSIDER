#!/bin/bash
# ALAYA INSIDER — PostgreSQL Backup Script
# Run via cron: 0 2 * * * /path/to/backup-postgres.sh

set -e

BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="alaya_insider_${DATE}.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "📦 Backing up PostgreSQL at $DATE..."

pg_dump "$DATABASE_URL" | gzip > "$BACKUP_DIR/$FILENAME"

# Keep only last 7 days
find "$BACKUP_DIR" -name "alaya_insider_*.sql.gz" -mtime +7 -delete

echo "✅ Backup complete: $BACKUP_DIR/$FILENAME"