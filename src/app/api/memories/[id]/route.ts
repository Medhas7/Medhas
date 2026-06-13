import { NextResponse } from "next/server";
import { deleteMemory, updateMemory } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}));
  const memory = await updateMemory(params.id, body);
  return NextResponse.json({ memory });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await deleteMemory(params.id);
  return NextResponse.json({ ok: true });
}
