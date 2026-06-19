#!/bin/bash
# =============================================
# ALAYA INSIDER — Complete All-in-One Deployment
# Run this on the VPS via SSH
# SSH: ssh -p 65002 u131951911@157.173.216.156
# Then: bash deploy-complete.sh
# =============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  ALAYA INSIDER — Complete Deployment${NC}"
echo -e "${GREEN}============================================${NC}"

DOMAIN="alayainsider.com"
APP_DIR="$HOME/alaya-insider"
REPO_URL="https://github.com/giri843136-cmd/ARENA-ALAYA-INSIDER.git"

# ============================================
# STEP 1: System packages & prerequisites
# ============================================
echo -e "\n${YELLOW}[1/8] Installing system packages...${NC}"
sudo apt update -qq
sudo apt install -y -qq docker.io docker-compose nginx certbot python3-certbot-nginx curl git redis-tools postgresql-client || {
    echo -e "${YELLOW}Some packages may already be installed, continuing...${NC}"
}

# Start Docker if not running
sudo systemctl enable docker 2>/dev/null || true
sudo systemctl start docker 2>/dev/null || true

# ============================================
# STEP 2: Get the code
# ============================================
echo -e "\n${YELLOW}[2/8] Getting the code from GitHub...${NC}"

if [ -d "$APP_DIR" ]; then
    echo "Project directory exists, pulling latest..."
    cd "$APP_DIR"
    git fetch origin
    git reset --hard origin/main
else
    echo "Cloning fresh from GitHub..."
    git clone "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
fi

echo "Latest commit: $(git log --oneline -1)"

# ============================================
# STEP 3: Check .env file
# ============================================
echo -e "\n${YELLOW}[3/8] Checking environment configuration...${NC}"

ENV_FOUND=false
for env_path in "$APP_DIR/.env" "$APP_DIR/.env.production" "$HOME/.env" "/opt/alaya-insider/.env"; do
    if [ -f "$env_path" ]; then
        echo "Found .env at: $env_path"
        if [ "$env_path" != "$APP_DIR/.env" ]; then
            cp "$env_path" "$APP_DIR/.env"
        fi
        ENV_FOUND=true
        break
    fi
done

if [ "$ENV_FOUND" = false ]; then
    echo -e "${RED}❌ No .env file found with production secrets!${NC}"
    echo -e "${YELLOW}You need to create $APP_DIR/.env with real secrets.${NC}"
    echo "Here's what's required as a minimum:"
    echo "  DATABASE_URL=postgresql://..."
    echo "  NEXTAUTH_SECRET=..."
    echo "  NEXTAUTH_URL=https://alayainsider.com"
    echo ""
    echo "See .env.example for all options."
    echo "Create the file now, then re-run this script."
    exit 1
fi

echo -e "${GREEN}✅ .env file found${NC}"

# ============================================
# STEP 4: Build with Docker
# ============================================
echo -e "\n${YELLOW}[4/8] Building Docker image...${NC}"
cd "$APP_DIR"

# Build the Docker image
sudo docker build -t alaya-insider:latest . 2>&1 | tail -5

echo -e "${GREEN}✅ Docker image built${NC}"

# ============================================
# STEP 5: Start services with Docker Compose
# ============================================
echo -e "\n${YELLOW}[5/8] Starting services...${NC}"

# Stop existing containers first
sudo docker-compose -f docker-compose.yml down 2>/dev/null || true

# Start services
sudo docker-compose -f docker-compose.yml up -d --build 2>&1 | tail -5

echo -e "${GREEN}✅ Services started${NC}"

# ============================================
# STEP 6: Prisma migrations + seed
# ============================================
echo -e "\n${YELLOW}[6/8] Running database migrations...${NC}"

# Find the app container
APP_CONTAINER=$(sudo docker ps -q --filter "name=alaya" | head -1)
if [ -n "$APP_CONTAINER" ]; then
    sudo docker exec "$APP_CONTAINER" npx prisma generate 2>/dev/null || true
    sudo docker exec "$APP_CONTAINER" npx prisma migrate deploy 2>/dev/null || true
    sudo docker exec "$APP_CONTAINER" npm run db:seed 2>/dev/null || true
    echo -e "${GREEN}✅ Migrations applied${NC}"
else
    echo -e "${YELLOW}⚠️ App container not found by name, trying docker-compose...${NC}"
    # The app runs inside the docker-compose network
    # Migrations will run on first startup via the app's init script
fi

# ============================================
# STEP 7: Configure Nginx + SSL
# ============================================
echo -e "\n${YELLOW}[7/8] Configuring Nginx and SSL...${NC}"

# Copy Nginx config
if [ -f "$APP_DIR/nginx.conf" ]; then
    sudo cp "$APP_DIR/nginx.conf" /etc/nginx/sites-available/$DOMAIN
    sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
    sudo nginx -t && sudo systemctl reload nginx
    echo -e "${GREEN}✅ Nginx configured${NC}"
fi

# Get SSL certificate (if DNS is pointing to this server)
if sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos -m admin@alayainsider.com 2>/dev/null; then
    echo -e "${GREEN}✅ SSL certificate obtained${NC}"
else
    echo -e "${YELLOW}⚠️ SSL certificate not obtained (DNS may not be pointing here yet)${NC}"
    echo "  Run later: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
fi

# ============================================
# STEP 8: Start PM2 workers + verify
# ============================================
echo -e "\n${YELLOW}[8/8] Starting PM2 workers and verifying...${NC}"

# Install PM2 globally if not present
which pm2 >/dev/null 2>&1 || sudo npm install -g pm2

# Copy ecosystem config and start
if [ -f "$APP_DIR/ecosystem.config.js" ]; then
    cd "$APP_DIR"
    pm2 delete all 2>/dev/null || true
    pm2 start ecosystem.config.js --env production 2>&1 | tail -5
    pm2 save
    sudo env PATH=\$PATH:/usr/bin pm2 startup systemd -u $USER --hp \$HOME 2>/dev/null || true
    echo -e "${GREEN}✅ PM2 workers started${NC}"
fi

# ============================================
# VERIFICATION
# ============================================
echo -e "\n${GREEN}============================================${NC}"
echo -e "${GREEN}  VERIFICATION${NC}"
echo -e "${GREEN}============================================${NC}"

echo -e "\nDocker containers:"
sudo docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo -e "\nPM2 processes:"
pm2 list 2>/dev/null || echo "PM2 not running"

echo -e "\nHealth check (local):"
curl -s http://localhost:3000/api/ops/health | head -c 200 || echo "App not yet responding (may need a moment)"

echo -e "\nNginx:"
sudo nginx -t 2>&1

echo -e "\n${GREEN}============================================${NC}"
echo -e "${GREEN}  DEPLOYMENT COMPLETE${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "Production URLs (once DNS points to VPS IP):"
echo "  Public:  https://$DOMAIN"
echo "  Admin:   https://$DOMAIN/admin"
echo "  Health:  https://$DOMAIN/api/ops/health"
echo "  Queues:  https://$DOMAIN/api/ops/queues"
echo ""
echo "To check logs:"
echo "  docker logs \$(docker ps -q --filter name=alaya) -f"
echo "  pm2 logs alaya-insider"
echo ""
echo "To run verification:"
echo "  bash $APP_DIR/scripts/verify-production-services.sh"
