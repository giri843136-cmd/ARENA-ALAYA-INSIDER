#!/bin/bash
# ALAYA INSIDER — Production Migration Runner
# Safe for production (uses migrate deploy, not dev)

set -e

echo "🔄 ALAYA INSIDER Production Migration"
echo "====================================="

if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL is required"
  exit 1
fi

echo "📦 Generating Prisma Client..."
npx prisma generate

echo "🗄️  Deploying migrations (production-safe)..."
npx prisma migrate deploy

echo "✅ Migrations completed successfully."