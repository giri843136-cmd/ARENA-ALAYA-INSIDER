/**
 * Article CMS Service (symmetric to ProductCMS)
 */
import { prisma } from "@/lib/db/prisma";
import { publishEvent } from "../events/eventBus";

export class ArticleCMS {
  async publishArticle(id: string, userId: string) {
    const article = await prisma.article.update({
      where: { id },
      data: { status: "PUBLISHED", publishedAt: new Date() },
    });

    await publishEvent("article.published", { articleId: id, userId });
    return article;
  }
}

export const articleCMS = new ArticleCMS();
