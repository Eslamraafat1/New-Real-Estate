import { NextResponse } from "next/server";
import { listDevelopments } from "@/lib/api/developments";

export async function GET() {
  return NextResponse.json(await listDevelopments());
}
