import { NextResponse } from "next/server";
import { listNeighborhoods } from "@/lib/api/locations";

export async function GET() {
  return NextResponse.json(await listNeighborhoods());
}
