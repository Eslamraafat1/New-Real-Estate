import { NextResponse } from "next/server";
import { submitValuationRequest } from "@/lib/api/inquiries";
import { validateValuation } from "@/lib/api/validation";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const fieldErrors = validateValuation(body as never);
  if (Object.keys(fieldErrors).length) {
    return NextResponse.json({ ok: false, error: "validation", fieldErrors }, { status: 422 });
  }
  try {
    return NextResponse.json(await submitValuationRequest(body as never), { status: 201 });
  } catch {
    return NextResponse.json({ ok: false, error: "upstream" }, { status: 502 });
  }
}
