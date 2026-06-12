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

echo "2. Deploy migrations to real PostgreSQL..."
npx prisma migrate deploy

echo "3. Seed real production data (products, brands, articles, etc.)..."
npm run db:seed

echo "4. Verify seed..."
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
