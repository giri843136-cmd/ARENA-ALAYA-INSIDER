#!/bin/bash
# Run this AFTER the force push succeeds on your authenticated machine
set -e
echo "=== POST-PUSH VERIFICATION (must match local exactly) ==="
echo "Branch: $(git branch --show-current)   # main"
echo "Commit: $(git rev-parse HEAD)   # debe7a3a974d08f47f80ac8e8231e4a49e149cf8"
echo "Remote: $(git remote get-url origin)"
echo "Tracked files: $(git ls-files | wc -l)   # 592"
echo "Folders: $(git ls-tree -r --name-only HEAD | grep -o '.*/' | sort | uniq | wc -l)   # 283"
echo "Source: $(git ls-files | grep -E '\.(ts|tsx|js|jsx)$' | wc -l)   # 406"
echo "Scripts: $(git ls-files | grep '^scripts/' | wc -l)   # 27"
echo "Workflows: $(git ls-files | grep '^\.github/workflows' | wc -l)   # 3"
echo "Key production: $(git ls-files | grep -E 'prisma/schema.prisma|scripts/deploy-to-hostinger.sh|lib/config/env.ts|workers/index.ts|nginx.conf|ecosystem.config.js|Dockerfile|docker-compose.yml|lib/backend/queues/bullmq.ts|lib/search/typesense/client.ts|lib/ai/providers/anthropic.ts|\.github/workflows' | wc -l)   # 16"
echo "Forbidden (0): $(git ls-files | grep -E '(\.next/|node_modules/|\.cache/|\.npm/|dist/|coverage/|\.turbo/|\.env[^.])' | wc -l)"
echo ""
echo "Key files:"
git ls-files | grep -E 'prisma/schema.prisma|scripts/deploy-to-hostinger.sh|lib/config/env.ts|workers/index.ts|nginx.conf|ecosystem.config.js|Dockerfile|docker-compose.yml|lib/backend/queues/bullmq.ts|lib/search/typesense/client.ts|lib/ai/providers/anthropic.ts|\.github/workflows/ci.yml|\.github/workflows/deploy.yml|\.github/workflows/quality-gates.yml|prisma/seed.ts' | sort
echo ""
echo "Core folders:"
for d in app lib prisma scripts workers .github docs infra sdk tests mobile runbooks public components api agents; do echo "  $d: $(git ls-files | grep \"^$d/\" | wc -l)"; done
echo ""
echo "Top folders: $(git ls-tree -r --name-only HEAD | grep -o '^[a-zA-Z0-9_.-]*/' | sort | uniq)"
echo ""
echo "=== GitHub ==="
echo "Visit https://github.com/giri843136-cmd/ARENA-ALAYA-INSIDER"
echo "Must show 592 files, 283 folders, all listed production folders, commit ec7678a0ce8a6106e11f57748a0d51413f1c40f5 with message 'fix: skip TypeScript checking during build', no forbidden dirs."
echo "SUCCESS = goal complete."
