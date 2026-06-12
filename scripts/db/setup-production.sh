#!/bin/bash
# ALAYA INSIDER — Production Database Setup
# Usage: bash scripts/db/setup-production.sh

set -e

echo "🚀 ALAYA INSIDER Production Database Setup"
echo "=========================================="

if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL not set. Export it first."
  exit 1
fi

echo "📦 Generating Prisma Client..."
npx prisma generate

echo "🗄️  Running migrations (deploy mode)..."
npx prisma migrate deploy

echo "🌱 Seeding production data..."
npx tsx prisma/seed.ts

echo "✅ Production database setup complete."
echo "   - Migrations applied"
echo "   - Seed data loaded"
echo "   - Ready for millions of users"