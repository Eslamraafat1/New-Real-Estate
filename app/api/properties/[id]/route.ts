import { NextResponse } from "next/server";
import { getProperty } from "@/lib/api/properties";

export async function GET(_req: Request, ctx: RouteContext<"/api/properties/[id]">) {
  const { id } = await ctx.params;
  const p = await getProperty(id);
  if (!p) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  return NextResponse.json(p, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
}
