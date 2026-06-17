#!/bin/bash
# Run this on the production VPS after copying code + .env.production (with REAL secrets)
set -e
echo "=== ALAYA INSIDER Real DB Setup + Seed ==="

if [ ! -f .env ]; then
  cp .env.production .env
fi

source .env

echo "1. Prisma generate..."
npx prisma generate

echo "2. Run security migration (passwordHash, 2FA, audit, delegated access)..."
psql "$DATABASE_URL" -f prisma/migrations/migration_add_security.sql 2>/dev/null || echo "Migration may already exist — continuing..."

echo "3. Deploy all Prisma migrations..."
npx prisma migrate deploy

echo "4. Seed real production data (including primary admin alayainsider@gmail.com)..."
npm run db:seed

echo "5. Verify seed..."
npx tsx -e "
const { prisma } = require('./lib/db/prisma');
(async () => {
  const counts = {
    products: await prisma.product.count(),
    brands: await prisma.brand.count(),
    articles: await prisma.article.count(),
    universes: await prisma.universe.count(),
    analytics: await prisma.analyticsEvent.count(),
  };
  console.log('Seeded counts:', counts);
  await prisma.\$disconnect();
})();
"

echo "✅ Real DB + seed complete."
