import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const presets = await prisma.importPreset.findMany({
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: presets.map((p) => ({
        id: p.id,
        name: p.name,
        network: p.network,
        columns: p.columns,
        defaultNetwork: p.defaultNetwork,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
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
    const { name, network, columns, defaultNetwork } = body;

    if (!name || !columns || typeof columns !== "object") {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Name and columns are required" } },
        { status: 400 }
      );
    }

    const preset = await prisma.importPreset.create({
      data: {
        name: name.trim(),
        network: network || "CUSTOM",
        columns: columns as any,
        defaultNetwork: defaultNetwork || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: preset.id,
        name: preset.name,
        network: preset.network,
        columns: preset.columns,
        defaultNetwork: preset.defaultNetwork,
        createdAt: preset.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "CREATE_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "id is required" } },
        { status: 400 }
      );
    }

    await prisma.importPreset.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "DELETE_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
