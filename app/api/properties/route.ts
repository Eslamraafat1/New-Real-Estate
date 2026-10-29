import { NextResponse } from "next/server";
import { listProperties } from "@/lib/api/properties";
import { parseQuery } from "@/lib/search";

export async function GET(request: Request) {
  const q = parseQuery(new URL(request.url).searchParams);
  try {
    return NextResponse.json(await listProperties(q), { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
  } catch {
    return NextResponse.json({ ok: false, error: "upstream" }, { status: 502 });
  }
}
