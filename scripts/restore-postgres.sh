#!/bin/bash
# ALAYA INSIDER — PostgreSQL Restore Script
# Usage: ./restore-postgres.sh backup_file.sql.gz

set -e

if [ -z "$1" ]; then
  echo "Usage: $0 backup_file.sql.gz"
  exit 1
fi

BACKUP_FILE=$1

echo "🔄 Restoring PostgreSQL from $BACKUP_FILE..."

gunzip -c "$BACKUP_FILE" | psql "$DATABASE_URL"

echo "✅ Restore completed."