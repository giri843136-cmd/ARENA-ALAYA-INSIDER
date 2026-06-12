#!/bin/bash
# ALAYA INSIDER — One-command production deploy to Hostinger VPS
# Usage (on your LOCAL machine with SSH access to VPS):
#   1. Fill .env.production with real secrets
#   2. scp -r . user@your-vps-ip:/home/alaya/alaya-insider
#   3. ssh user@your-vps-ip
#   4. cd /home/alaya/alaya-insider && bash scripts/deploy-to-hostinger.sh

set -e

echo "🚀 ALAYA INSIDER Production Deploy to Hostinger"
echo "================================================"

VPS_USER="${VPS_USER:-root}"
VPS_HOST="${VPS_HOST:-your-vps-ip}"
DOMAIN="alayainsider.com"

echo "Step 1/8: Install dependencies on VPS (run this locally or via ssh)..."
# (This script is meant to be run ON the VPS after code is copied)

if [ ! -f ".env.production" ]; then
  echo "❌ .env.production missing! Copy your filled version first."
  exit 1
fi

cp .env.production .env

echo "Step 2/8: Install system packages (Docker, PM2, Nginx, Certbot)..."
apt update
apt install -y docker.io docker-compose nginx certbot python3-certbot-nginx curl redis-tools postgresql-client

echo "Step 3/8: Build Docker image..."
docker build -t alaya-insider:latest .

echo "Step 4/8: Start services with Docker Compose (Postgres + Redis + Typesense + App)..."
# Use the existing docker-compose.yml but override for prod
docker-compose -f docker-compose.yml up -d --build

echo "Step 5/8: Run Prisma migrations + seed (real DB)..."
docker exec -it $(docker ps -q -f name=alaya) npx prisma migrate deploy || true
docker exec -it $(docker ps -q -f name=alaya) npm run db:seed || true

echo "Step 6/8: Configure Nginx + SSL..."
cp nginx.conf /etc/nginx/sites-available/alayainsider.com
ln -sf /etc/nginx/sites-available/alayainsider.com /etc/nginx/sites-enabled/
sed -i "s|alayainsider.com|$DOMAIN|g" /etc/nginx/sites-available/alayainsider.com
nginx -t
systemctl reload nginx

certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos -m admin@alayainsider.com || echo "⚠️ Certbot may need manual run if DNS not ready"

echo "Step 7/8: Start PM2 workers (for BullMQ background jobs)..."
npm install -g pm2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup systemd -u $VPS_USER --hp /home/$VPS_USER

echo "Step 8/8: Verify production health..."
curl -I https://$DOMAIN/api/ops/health || echo "Health check will work after DNS/SSL"

echo ""
echo "✅ Deployment steps completed on VPS."
echo "Final verification commands (run on VPS):"
echo "  bash scripts/verify-production-services.sh"
echo "  curl https://$DOMAIN"
echo "  curl https://$DOMAIN/admin"
echo ""
echo "Production URLs (once DNS points to VPS IP):"
echo "  https://alayainsider.com"
echo "  https://alayainsider.com/admin"
