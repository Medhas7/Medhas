import { NextResponse } from "next/server";
import { createMemory, listMemories } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const memories = await listMemories();
  return NextResponse.json({ memories });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (!body?.title || !body?.content) {
    return NextResponse.json({ error: "title and content are required" }, { status: 400 });
  }
  const memory = await createMemory(body);
  return NextResponse.json({ memory }, { status: 201 });
}
