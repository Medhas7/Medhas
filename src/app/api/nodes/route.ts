import { NextResponse } from "next/server";
import { listNodes } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const nodes = await listNodes();
  return NextResponse.json({ nodes });
}
