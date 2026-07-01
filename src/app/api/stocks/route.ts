import { NextResponse } from "next/server";

import { getStockList } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawLimit = searchParams.get("limit");
  const limit = rawLimit ? Number(rawLimit) : 100;

  try {
    const stocks = await getStockList(Number.isFinite(limit) ? limit : 100);
    return NextResponse.json({ status: "ok", total: stocks.length, data: stocks });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
