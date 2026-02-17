import { NextResponse } from "next/server";
import { buildOpenAlexTrends } from "@/lib/trends/openalexTrends";

// runtime and revalidate removed to fix build error

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const refresh = url.searchParams.get("refresh") === "1";

    const payload = await buildOpenAlexTrends(refresh);

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=86400",
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to build trends", details: message },
      { status: 500 }
    );
  }
}