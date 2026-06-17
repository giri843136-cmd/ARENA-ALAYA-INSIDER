#!/bin/bash
# MANUAL PUSH COMMANDS - Run OUTSIDE this sandbox on your local machine with GitHub PAT (repo + workflow scopes)
# This will upload the COMPLETE ALAYA INSIDER (all phases 1-15 + full production: public site, admin, Prisma+seed, APIs, search, Recommendation Engine, AI Workspace, analytics, BullMQ, Docker/PM2/Nginx, backups, health, mobile, SDKs, future, docs, tests, CI/CD, global infra, every script and artifact)

set -e

echo "=== 1. cd to your local copy of the project (must have the same files as committed here) ==="
echo "cd /path/to/your/alaya-insider-project"

echo ""
echo "=== 2. Remote ==="
git remote remove origin || true
git remote add origin https://github.com/giri843136-cmd/ARENA-ALAYA-INSIDER.git
git remote -v

echo ""
echo "=== 3. Auth ==="
git config --global credential.helper store
# Or inline: git remote set-url origin https://giri843136-cmd:<YOUR_PAT>@github.com/giri843136-cmd/ARENA-ALAYA-INSIDER.git

echo ""
echo "=== 4. Prepare (keep local newest) ==="
git branch -M main
git fetch origin
git pull origin main --allow-unrelated-histories --strategy=recursive -X ours || true
git status

echo ""
echo "=== 5. FORCE PUSH ==="
git push -u origin main --force

echo ""
echo "=== 6. Verify ==="
echo "Branch: $(git branch --show-current)   # main"
echo "Commit: $(git rev-parse HEAD)   # ebcafc6fcda88a1d6fbb163d768581ac692b8f67"
echo "Tracked: $(git ls-files | wc -l)   # 362"
echo "Key files: $(git ls-files | grep -E 'prisma/schema.prisma|scripts/deploy-to-hostinger.sh|lib/config/env.ts|workers/index.ts|nginx.conf|ecosystem.config.js|Dockerfile|docker-compose.yml|lib/backend/queues/bullmq.ts|lib/search/typesense/client.ts|lib/ai/providers/anthropic.ts|\.github/workflows' | wc -l)   # 16"
