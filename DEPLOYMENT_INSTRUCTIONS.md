# ALAYA INSIDER — Production Deployment (Hostinger VPS)

## Prerequisites (do this once)
- Hostinger VPS with Ubuntu 22.04+
- Domain alayainsider.com pointed to VPS IP (A record)
- Real accounts/keys for: PostgreSQL (or Neon/Hostinger DB), Redis, Typesense Cloud, Google OAuth, Resend, Cloudinary, Anthropic (or OpenAI), optional Sentry

## 1. On your LOCAL machine
```bash
# Fill real secrets
cp .env.production.example .env.production
# Edit .env.production with REAL values (especially NEXTAUTH_SECRET, DATABASE_URL, etc.)

# Build and copy to VPS (example)
tar -czf alaya-prod.tar.gz --exclude=node_modules --exclude=.next .
scp alaya-prod.tar.gz root@YOUR_VPS_IP:/root/
scp .env.production root@YOUR_VPS_IP:/root/
```

## 2. On the VPS (ssh root@YOUR_VPS_IP)
```bash
cd /root
tar -xzf alaya-prod.tar.gz -C /opt/alaya-insider
cd /opt/alaya-insider
cp ../.env.production .env

# Install Docker + PM2 + Nginx + Certbot
apt update && apt install -y docker.io docker-compose nginx certbot python3-certbot-nginx curl

# Run the deploy script
bash scripts/deploy-to-hostinger.sh

# Verify services
bash scripts/verify-production-services.sh

# Setup real DB + seed (AFTER .env has real DATABASE_URL)
bash scripts/setup-real-db-and-seed.sh

# Final audit
bash scripts/production-audit.sh
```

## 3. DNS + SSL
- Point alayainsider.com + www to VPS IP
- Certbot already runs in the deploy script (or run manually: `certbot --nginx -d alayainsider.com -d www.alayainsider.com`)

## 4. Final Verification (after DNS propagates)
- https://alayainsider.com → public site
- https://alayainsider.com/admin → admin (login with Google OAuth)
- Create a product in Product Studio
- Search should work
- AI Workspace should generate content (uses real Anthropic key)
- Queues (BullMQ) process background jobs
- Health: https://alayainsider.com/api/ops/health (should be "healthy" or "degraded" only if services missing)

## Production URLs (once live)
- Public: https://alayainsider.com
- Admin: https://alayainsider.com/admin
- Health: https://alayainsider.com/api/ops/health
- Queues status: https://alayainsider.com/api/ops/queues

All graceful degradation, health checks, backups, workers, and monitoring are pre-wired.
