import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
  const status = searchParams.get("status") || "PUBLISHED";
  const universe = searchParams.get("universe");
  const author = searchParams.get("author");
  const tag = searchParams.get("tag");
  const featured = searchParams.get("featured");

  try {
    const where: any = { status };
    if (universe) where.universe = { slug: universe.toUpperCase() };
    if (author) where.author = { slug: author };
    if (featured === "true") where.featured = true;
    if (tag) where.articleTags = { some: { tag: { slug: tag } } };

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          author: { select: { id: true, name: true, slug: true, avatar: true } },
          universe: { select: { id: true, slug: true, title: true } },
          _count: { select: { comments: true } },
        },
      }),
      prisma.article.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: articles,
      pagination: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "FETCH_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const article = await prisma.article.create({
      data: {
        slug: body.slug,
        title: body.title,
        subtitle: body.subtitle,
        excerpt: body.excerpt,
        content: body.content,
        featuredImage: body.featuredImage,
        readingTime: body.readingTime,
        status: body.status || "DRAFT",
        authorId: body.authorId,
        universeId: body.universeId,
      },
    });
    return NextResponse.json({ success: true, data: article }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "CREATE_ERROR", message: error.message } },
      { status: 400 }
    );
  }
}
