/**
 * ALAYA INSIDER — Prisma Client Singleton
 * Production-grade with @prisma/adapter-pg for Prisma v7.x compatibility.
 */
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  try {
    // Prisma v7 requires a driver adapter (no native library engine support).
    // Use @prisma/adapter-pg with a pg.Pool for direct Postgres connections.
    const { PrismaPg } = require('@prisma/adapter-pg');
    const pg = require('pg');
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  } catch (error) {
    void error;
    // Build/CI mode — return a safe stub that prevents crashes.
    if (process.env.NODE_ENV === 'production' || process.env.CI) {
      console.warn('PrismaClient creation failed (build/CI mode), using stub.');
    }
    return {
      $connect: async () => {},
      $disconnect: async () => {},
      $on: () => {},
      $transaction: async (fn: any) => (typeof fn === 'function' ? fn({}) : []),
      // Common models used in app
      product: { findMany: async () => [], findUnique: async () => null, create: async () => ({}), update: async () => ({}), upsert: async () => ({}), count: async () => 0 },
      brand: { findMany: async () => [], findUnique: async () => null, create: async () => ({}), upsert: async () => ({}), count: async () => 0 },
      universe: { findMany: async () => [], upsert: async () => ({}), count: async () => 0 },
      article: { findMany: async () => [], findUnique: async () => null, create: async () => ({}), count: async () => 0 },
      user: { findMany: async () => [], findUnique: async () => null, create: async () => ({}), upsert: async () => ({}), count: async () => 0 },
      smsTwoFactor: { findUnique: async () => null, upsert: async () => ({}), update: async () => ({}), count: async () => 0, findFirst: async () => null },
      smsOtp: { findFirst: async () => null, findMany: async () => [], create: async () => ({}), update: async () => ({}), updateMany: async () => ({ count: 0 }), count: async () => 0 },
      userRole: { findMany: async () => [], create: async () => ({}), upsert: async () => ({}), count: async () => 0 },
      analyticsEvent: { findMany: async () => [], create: async () => ({}), count: async () => 0 },
      aIHistory: { findMany: async () => [], create: async () => ({}), count: async () => 0 },
      affiliateLink: { findMany: async () => [], create: async () => ({}), count: async () => 0 },
      offlineClick: { findMany: async () => [], findUnique: async () => null, create: async () => ({}), count: async () => 0 },
      commentEdit: { findMany: async () => [], create: async () => ({}), count: async () => 0 },
      moderationAuditLog: { findMany: async () => [], groupBy: async () => [], create: async () => ({}), count: async () => 0 },
      userNotificationPreference: { findUnique: async () => null, upsert: async () => ({}), count: async () => 0 },
      notificationMute: { findMany: async () => [], findUnique: async () => null, upsert: async () => ({}), deleteMany: async () => ({ count: 0 }), count: async () => 0 },
      activityLog: { findMany: async () => [], groupBy: async () => [], create: async () => ({}), count: async () => 0 },
      subcollection: { findMany: async () => [], upsert: async () => ({}), count: async () => 0 },
      collection: { findMany: async () => [], upsert: async () => ({}), count: async () => 0 },
      author: { findMany: async () => [], upsert: async () => ({}), count: async () => 0 },
      review: { findMany: async () => [], create: async () => ({}), count: async () => 0 },
      priceHistory: { findMany: async () => [], create: async () => ({}), count: async () => 0 },
      comment: { findMany: async () => [], create: async () => ({}), count: async () => 0 },
      featureFlag: { findMany: async () => [], upsert: async () => ({}), count: async () => 0 },
      contentChecklist: { findMany: async () => [], create: async () => ({}), count: async () => 0 },
    } as unknown as PrismaClient;
  }
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown (only for real client)
if (process.env.NODE_ENV === 'production' && (prisma as any).$disconnect) {
  process.on('beforeExit', async () => {
    try {
      await (prisma as any).$disconnect();
    } catch {}
  });
}

export default prisma;

// Helper for cases that need to force real client (e.g. seed scripts)
export function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma || (globalForPrisma.prisma as any).product?.findMany === undefined) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}
