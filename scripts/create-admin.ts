/**
 * Quick script to create/update the primary admin user.
 * Uses getPrismaClient() which handles Prisma v7 adapter requirements.
 */
import { getPrismaClient } from '../lib/db/prisma';

const prisma = getPrismaClient();

async function main() {
  const bcrypt = require('bcryptjs');
  const password = process.env.PRIMARY_ADMIN_PASSWORD || 'AlayaAdmin2026!';
  const hash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email: 'alayainsider@gmail.com' },
    update: {},
    create: {
      email: 'alayainsider@gmail.com',
      name: 'Admin',
      currency: 'USD',
      language: 'en',
    },
  });

  await prisma.$executeRawUnsafe(
    `INSERT INTO "User" (id, "passwordHash") VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET "passwordHash" = $2`,
    user.id, hash
  );

  await prisma.userRole.upsert({
    where: { userId_role: { userId: user.id, role: 'SUPER_ADMIN' } },
    update: {},
    create: { userId: user.id, role: 'SUPER_ADMIN' },
  });

  console.log('ADMIN CREATED:', user.email, password);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
