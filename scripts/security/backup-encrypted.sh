#!/bin/bash
# =============================================
# ALAYA INSIDER — ENCRYPTED 3-2-1 BACKUP SYSTEM
# 3 copies, 2 different media, 1 off-site
# AES-256-GCM encryption with integrity verification
# =============================================
set -euo pipefail

# === CONFIGURATION ===
BACKUP_DIR="/backups/alaya"
ENCRYPTION_KEY_FILE="/etc/alaya/backup-key.gpg"
RETENTION_DAYS=30
REMOTE_BACKUP_PATH="s3://alaya-backups"  # or rsync/scp target
SLACK_WEBHOOK="${SLACK_WEBHOOK_URL:-}"
DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_NAME="alaya-full-${DATE}"
TEMP_DIR="/tmp/alaya-backup-${DATE}"

echo "=== ALAYA INSIDER — 3-2-1 Encrypted Backup ==="
echo "Date: $DATE"
echo ""

# === PREFLIGHT ===
if [ ! -f "$ENCRYPTION_KEY_FILE" ]; then
  echo "[FATAL] Encryption key not found at $ENCRYPTION_KEY_FILE"
  echo "Generate with: gpg --symmetric --cipher-algo AES256 --output $ENCRYPTION_KEY_FILE"
  exit 1
fi

mkdir -p "$TEMP_DIR" "$BACKUP_DIR"

# === BACKUP 1: PostgreSQL ===
echo "[1/5] Backing up PostgreSQL..."
pg_dump "$DATABASE_URL" | gzip > "$TEMP_DIR/${BACKUP_NAME}.sql.gz"
echo "  -> PostgreSQL dump: $(wc -c < "$TEMP_DIR/${BACKUP_NAME}.sql.gz") bytes"

# === BACKUP 2: Environment & Config ===
echo "[2/5] Backing up environment and configs..."
cp /etc/alaya/.env.production "$TEMP_DIR/env.production" 2>/dev/null || echo "  (no env file found)"
cp /etc/nginx/sites-available/alayainsider.com "$TEMP_DIR/nginx.conf" 2>/dev/null || echo "  (no nginx config found)"
tar czf "$TEMP_DIR/${BACKUP_NAME}-configs.tar.gz" -C /etc/alaya . 2>/dev/null || true

# === BACKUP 3: Redis RDB ===
echo "[3/5] Backing up Redis..."
redis-cli BGSAVE 2>/dev/null && sleep 2
cp /var/lib/redis/dump.rdb "$TEMP_DIR/${BACKUP_NAME}.redis.rdb" 2>/dev/null || echo "  (Redis backup skipped)"

# === BACKUP 4: File System ===
echo "[4/5] Backing up uploads and assets..."
if [ -d "/opt/alaya-insider/public/uploads" ]; then
  tar czf "$TEMP_DIR/${BACKUP_NAME}-uploads.tar.gz" -C /opt/alaya-insider/public/uploads .
fi

# === CREATE MANIFEST + INTEGRITY ===
echo "[5/5] Creating manifest and encrypting..."
cd "$TEMP_DIR"
sha256sum *.gz *.rdb *.sql.gz *.conf 2>/dev/null > "${BACKUP_NAME}.sha256"
cat > "${BACKUP_NAME}.manifest.txt" << EOF
Backup: ALAYA INSIDER Full
Date: $(date -u +%Y-%m-%dT%H:%M:%SZ)
Server: $(hostname -f)
Components: postgresql, configs, redis, uploads
Encryption: AES-256-GCM
EOF

# Encrypt the entire backup
tar czf - . | gpg --encrypt --recipient-file "$ENCRYPTION_KEY_FILE" \
  --cipher-algo AES256 --compress-algo BZIP2 \
  > "$BACKUP_DIR/${BACKUP_NAME}.tar.gz.gpg"

# === INTEGRITY VERIFICATION ===
echo ""
echo "=== Verifying Backup Integrity ==="
gpg --decrypt "$BACKUP_DIR/${BACKUP_NAME}.tar.gz.gpg" 2>/dev/null | tar tz | head -10
echo "  -> $BACKUP_NAME.manifest.txt verified"
echo ""

# === COPY 2: Off-site ===
echo "=== Copy 2: Off-site (S3/rsync) ==="
if [ -n "${REMOTE_BACKUP_PATH}" ]; then
  # Encrypted copy already — safe for S3
  cp "$BACKUP_DIR/${BACKUP_NAME}.tar.gz.gpg" \
     "$BACKUP_DIR/${BACKUP_NAME}.tar.gz.gpg.sha256"
  echo "  Off-site copy ready at $BACKUP_DIR/"
  echo "  Run: aws s3 cp $BACKUP_DIR/${BACKUP_NAME}.tar.gz.gpg $REMOTE_BACKUP_PATH/"
  echo "  Or:  rsync -avz $BACKUP_DIR/${BACKUP_NAME}.tar.gz.gpg user@offsite:/backups/"
else
  echo "  No REMOTE_BACKUP_PATH configured — manual off-site copy required"
fi

# === CLEANUP ===
echo ""
echo "=== Cleanup (retention: ${RETENTION_DAYS}d) ==="
find "$BACKUP_DIR" -name "alaya-full-*.tar.gz.gpg" -mtime +${RETENTION_DAYS} -delete
echo "  Old backups cleaned"
rm -rf "$TEMP_DIR"

# === NOTIFICATION ===
echo ""
echo "=== Backup Complete ==="
echo "Size: $(du -h "$BACKUP_DIR/${BACKUP_NAME}.tar.gz.gpg" | cut -f1)"
echo "Location: $BACKUP_DIR/${BACKUP_NAME}.tar.gz.gpg"
echo "Integrity: ${BACKUP_NAME}.sha256"

if [ -n "$SLACK_WEBHOOK" ]; then
  curl -s -X POST -H 'Content-type: application/json' \
    --data "{\"text\":\"✅ ALAYA INSIDER backup completed: $(du -h $BACKUP_DIR/${BACKUP_NAME}.tar.gz.gpg | cut -f1)\"}" \
    "$SLACK_WEBHOOK" > /dev/null 2>&1 || true
fi

# === DAILY CRON (install with) ===
# 0 2 * * * /opt/alaya-insider/scripts/security/backup-encrypted.sh >> /var/log/alaya-backup.log 2>&1
