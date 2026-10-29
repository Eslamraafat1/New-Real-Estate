import { NextResponse } from "next/server";
import { listLocations } from "@/lib/api/locations";

export async function GET() {
  return NextResponse.json(await listLocations());
}
