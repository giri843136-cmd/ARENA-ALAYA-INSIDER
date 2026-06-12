#!/bin/bash
# Run this AFTER the force push succeeds on your authenticated machine
set -e
echo "=== POST-PUSH VERIFICATION (must match local exactly) ==="
echo "Branch: $(git branch --show-current)   # main"
echo "Commit: $(git rev-parse HEAD)   # ebcafc6fcda88a1d6fbb163d768581ac692b8f67"
echo "Remote: $(git remote get-url origin)"
echo "Tracked files: $(git ls-files | wc -l)   # 362"
echo "Folders: $(git ls-tree -r --name-only HEAD | grep -o '.*/' | sort | uniq | wc -l)   # 166"
echo "Source: $(git ls-files | grep -E '\.(ts|tsx|js|jsx)$' | wc -l)   # 204"
echo "Scripts: $(git ls-files | grep '^scripts/' | wc -l)   # 25"
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
echo "Must show 362 files, 166 folders, all listed production folders, commit ebcafc6fcda88a1d6fbb163d768581ac692b8f67 with message 'ALAYA INSIDER complete production platform', no forbidden dirs."
echo "SUCCESS = goal complete."
