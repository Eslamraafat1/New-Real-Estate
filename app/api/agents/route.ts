import { NextResponse } from "next/server";
import { listAgents } from "@/lib/api/agents";

export async function GET() {
  return NextResponse.json(await listAgents());
}
