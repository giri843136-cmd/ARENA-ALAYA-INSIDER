import { NextRequest, NextResponse } from "next/server";
import { searchAll } from "@/lib/search/services/searchService";
import { trackSearchEvent } from "@/lib/search/analytics/tracker";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SearchParams {
  q: string;
  page: number;
  limit: number;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "relevance" | "price_asc" | "price_desc" | "rating" | "newest";
  type?: "all" | "products" | "articles" | "brands";
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const params: SearchParams = {
    q: searchParams.get("q") || "",
    page: parseInt(searchParams.get("page") || "1"),
    limit: Math.min(parseInt(searchParams.get("limit") || "20"), 100),
    category: searchParams.get("category") || undefined,
    brand: searchParams.get("brand") || undefined,
    minPrice: searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined,
    maxPrice: searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined,
    sort: (searchParams.get("sort") as SearchParams["sort"]) || "relevance",
    type: (searchParams.get("type") as SearchParams["type"]) || "all",
  };

  try {
    const results = await searchAll(params.q, {
      page: params.page,
      perPage: params.limit,
      filters: [
        params.category ? `category:=${params.category}` : "",
        params.brand ? `brand:=${params.brand}` : "",
        params.minPrice ? `price:>=${params.minPrice}` : "",
        params.maxPrice ? `price:<=${params.maxPrice}` : "",
      ].filter(Boolean).join("&&"),
    });

    // Track search for analytics
    try {
      await trackSearchEvent({
        query: params.q,
        resultCount: results.totalFound,
        filters: [params.category, params.brand].filter(Boolean).join(","),
      });
    } catch {}

    return NextResponse.json({
      success: true,
      data: results,
      pagination: {
        page: params.page,
        limit: params.limit,
        total: results.totalFound,
        totalPages: Math.max(1, Math.ceil(results.totalFound / params.limit)),
        hasNext: params.page * params.limit < results.totalFound,
        hasPrev: params.page > 1,
      },
    });
  } catch (error: any) {
    console.error("Search error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SEARCH_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
