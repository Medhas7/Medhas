import { NextResponse } from "next/server";
import { storeMode } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ ok: true, mode: storeMode() });
}
