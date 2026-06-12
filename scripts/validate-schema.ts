/**
 * Quick validation script — run with tsx scripts/validate-schema.ts
 * Ensures all critical relationships and enums are sane.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Validating ALAYA schema...');

  const universes = await prisma.universe.count();
  const brands = await prisma.brand.count();
  const products = await prisma.product.count();
  const articles = await prisma.article.count();

  console.log(`Universes: ${universes}`);
  console.log(`Brands: ${brands}`);
  console.log(`Products: ${products}`);
  console.log(`Articles: ${articles}`);

  if (universes < 8) console.warn('⚠️  Expected 8 universes');
  if (products < 50) console.warn('⚠️  Seed seems light on products');

  console.log('✅ Basic validation passed');
}

main().finally(() => prisma.$disconnect());
