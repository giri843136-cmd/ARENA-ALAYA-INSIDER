#!/bin/bash
# ALAYA INSIDER — Redis Backup (RDB snapshot + optional dump)

set -e

REDIS_HOST=${REDIS_HOST:-localhost}
REDIS_PORT=${REDIS_PORT:-6379}
BACKUP_DIR="/backups/redis"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

echo "📦 Backing up Redis..."

# Trigger RDB save
redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" BGSAVE

# Copy RDB file (adjust path for your Redis config)
cp /var/lib/redis/dump.rdb "$BACKUP_DIR/alaya_redis_${DATE}.rdb"

find "$BACKUP_DIR" -name "*.rdb" -mtime +14 -delete

echo "✅ Redis backup complete."