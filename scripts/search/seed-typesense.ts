/**
 * Seed Typesense from existing beautiful seed data + Prisma.
 */

import { fullReindex } from '@/lib/search/typesense/indexer';

async function main() {
  console.log('Seeding Typesense from database...');
  await fullReindex();
  console.log('Typesense seeded successfully.');
}

main();
