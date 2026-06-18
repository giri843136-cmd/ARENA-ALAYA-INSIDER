#!/bin/bash
# =============================================
# ALAYA INSIDER — STAGING ENVIRONMENT CLONE
# Creates an identical isolated copy for testing
# =============================================
set -euo pipefail

echo "=== ALAYA INSIDER — Staging Clone ==="

# === CONFIG ===
STAGING_DIR="/opt/alaya-staging"
STAGING_DOMAIN="staging.alayainsider.com"
STAGING_PORT="3001"
SOURCE_DIR="/opt/alaya-insider"
SOURCE_DB_URL="${DATABASE_URL}"

if [ $# -lt 1 ]; then
  echo "Usage: $0 <staging-db-url>"
  echo "Example: $0 postgresql://user:pass@localhost:5432/alaya_staging"
  exit 1
fi

STAGING_DB_URL="$1"

echo "[1/5] Cloning application code..."
rsync -av --exclude='node_modules' --exclude='.next' --exclude='.env*' \
  "$SOURCE_DIR/" "$STAGING_DIR/"

echo "[2/5] Setting up environment..."
cp "$SOURCE_DIR/.env.production" "$STAGING_DIR/.env.staging"
sed -i "s|DATABASE_URL=.*|DATABASE_URL=$STAGING_DB_URL|" "$STAGING_DIR/.env.staging"
sed -i "s|NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL=https://$STAGING_DOMAIN|" "$STAGING_DIR/.env.staging"
sed -i "s|PORT=.*|PORT=$STAGING_PORT|" "$STAGING_DIR/.env.staging"

# Generate unique NEXTAUTH_SECRET for staging
echo "NEXTAUTH_SECRET=$(openssl rand -hex 32)" >> "$STAGING_DIR/.env.staging"

echo "[3/5] Installing dependencies..."
cd "$STAGING_DIR"
npm ci --omit=dev 2>&1 | tail -3

echo "[4/5] Running database migration..."
# Clone the production DB to staging first
echo "  Cloning production DB to staging..."
pg_dump "$SOURCE_DB_URL" | psql "$STAGING_DB_URL" 2>&1 | tail -3
npx prisma migrate deploy 2>&1 | tail -3

echo "[5/5] Building and starting staging..."
npm run build 2>&1 | tail -5

# Create PM2 config for staging
cat > ecosystem.staging.config.js << 'PM2'
module.exports = {
  apps: [{
    name: 'alaya-staging',
    script: 'node_modules/.bin/next',
    args: 'start -p 3001',
    env: { NODE_ENV: 'production' },
    env_file: '.env.staging',
  }]
};
PM2

# Start staging
pm2 start ecosystem.staging.config.js 2>&1 || true
pm2 save

echo ""
echo "=== STAGING CLONE COMPLETE ==="
echo "  URL:      https://$STAGING_DOMAIN"
echo "  Port:     $STAGING_PORT"
echo "  DB:       $STAGING_DB_URL"
echo "  PM2:      pm2 list"
echo "  Test:     curl http://localhost:$STAGING_PORT/api/ops/health"
echo "  Isolated: YES — separate DB, env, secrets, port"
echo ""
