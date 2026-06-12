/**
 * ALAYA INSIDER — Product CMS Service
 * Full CRUD + publishing workflow + version history.
 */

import { prisma } from "@/lib/db/prisma";
import { ProductStatus } from "@prisma/client";
import { enqueueTask } from "@/lib/ai/jobs/queue";
import { publishEvent } from "../events/eventBus";

export class ProductCMS {
  async createProduct(data: any, userId: string) {
    const product = await prisma.product.create({
      data: {
        ...data,
        status: ProductStatus.DRAFT,
        // publishedBy etc handled on publish
      },
    });

    await publishEvent("product.created" as any, { productId: product.id, userId });
    return product;
  }

  async updateProduct(id: string, data: any, userId: string) {
    const current = await prisma.product.findUnique({ where: { id } });
    if (!current) throw new Error("Product not found");

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        // no updatedBy on schema; use activity log
      },
    });

    await publishEvent("product.updated", { productId: id, changes: data, userId });
    return updated;
  }

  async publishProduct(id: string, userId: string) {
    const product = await prisma.product.update({
      where: { id },
      data: {
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });

    await publishEvent("product.published", { productId: id, userId });

    // Trigger downstream systems (search index, recommendations, AI)
    await enqueueTask({
      agentType: "SEO_STRATEGIST" as any,
      input: { entityId: id, entityType: "product" },
      userId,
      provider: 'anthropic',
      version: 1,
      priority: 'normal',
    });

    return product;
  }

  async getProducts(params: { page?: number; limit?: number; universe?: string | null } = {}) {
    const { page = 1, limit = 24, universe } = params;
    const where: any = {};
    if (universe) where.universe = { slug: universe.toUpperCase() as any };
    return prisma.product.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      include: { brand: true, universe: true },
      orderBy: { publishedAt: 'desc' },
    });
  }

  async getProductWithHistory(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        brand: true,
        universe: true,
        affiliateLinks: true,
        priceHistory: { orderBy: { recordedAt: "desc" }, take: 20 },
      },
    });
  }

  async bulkUpdateStatus(ids: string[], status: ProductStatus, userId: string) {
    const result = await prisma.product.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });

    await publishEvent("product.bulk_status_changed" as any, { ids, status, userId });
    return result;
  }
}

export const productCMS = new ProductCMS();
