#!/bin/bash
# ====================================================
# ALAYA INSIDER — Server Recovery Script
# ====================================================
# Run this ON the Hostinger server via SSH when it's reachable:
#   ssh u131951911@157.173.216.156 -p 65002
#   cd /home/u131951911/alaya-insider
#   bash scripts/server-recovery.sh
# ====================================================

set -e

echo "=============================================="
echo " ALAYA INSIDER — Full Server Recovery"
echo "=============================================="

export PATH="/opt/alt/alt-nodejs22/root/usr/bin:/usr/bin:/bin"
cd /home/u131951911/alaya-insider

# Load DATABASE_URL from .env file (safer than hardcoding)
if [ -f .env ]; then
  set -a; source .env; set +a
  echo "  Loaded .env file"
else
  # Fallback only if .env is missing
  export DATABASE_URL="postgresql://neondb_owner:npg_iM9BdrvJwCN5@ep-bitter-boat-atdubjm7-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require"
  echo "  WARNING: .env not found, using fallback DATABASE_URL"
fi

echo ""
echo "[1/8] Kill any existing processes..."
pkill -f "next" 2>/dev/null || true
pkill -f "node.*next" 2>/dev/null || true
sleep 2
echo "  Done"

echo ""
echo "[2/8] Verify .env file..."
cat .env 2>/dev/null | head -3 || echo "  WARNING: .env missing"
echo "  Done"

echo ""
echo "[3/8] Regenerate Prisma Client..."
npx prisma generate 2>&1 | tail -3
echo "  Done"

echo ""
echo "[4/8] Sync database schema..."
npx prisma migrate deploy 2>&1 | tail -5 || npx prisma db push --accept-data-loss 2>&1 | tail -5
echo "  Done"

echo ""
echo "[5/8] Verify database has data..."
npx tsx -e "
import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()
const [products, brands, articles, universes] = await Promise.all([
  p.product.count(),
  p.brand.count(),
  p.article.count(),
  p.universe.count()
])
console.log('  Products:', products)
console.log('  Brands:', brands)
console.log('  Articles:', articles)
console.log('  Universes:', universes)
await p.\$disconnect()
" 2>&1
echo "  Done"

echo ""
echo "[6/8] Start Next.js app..."
NODE_ENV=production PORT=3000 nohup /opt/alt/alt-nodejs22/root/usr/bin/node \
  /home/u131951911/alaya-insider/node_modules/.bin/next start -p 3000 \
  > /home/u131951911/app.log 2>&1 &
APP_PID=$!
echo "  PID: $APP_PID"

echo ""
echo "[7/8] Wait 20s for startup..."
sleep 20

echo ""
echo "[8/8] Verify app is running..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 http://127.0.0.1:3000/ 2>&1)
echo "  Homepage: HTTP $HTTP_CODE"

HEALTH=$(curl -s --max-time 10 http://127.0.0.1:3000/api/ops/health 2>&1 | head -c 200)
echo "  Health: $HEALTH"

echo ""
echo "=============================================="
echo " RECOVERY COMPLETE"
echo " App PID: $APP_PID"
echo " Homepage: HTTP $HTTP_CODE"
echo "=============================================="
echo ""
echo "To check logs: tail -50 /home/u131951911/app.log"
echo "To set up cron for auto-restart, see: scripts/cron-watchdog.sh"
