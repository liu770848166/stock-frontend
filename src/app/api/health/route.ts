import { NextResponse } from "next/server";

import { checkDatabaseConnection } from "@/lib/db";

export async function GET() {
  try {
    const result = await checkDatabaseConnection();

    return NextResponse.json({
      status: "ok",
      database: result,
    });
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
