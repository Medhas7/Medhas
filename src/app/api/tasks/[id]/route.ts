import { NextResponse } from "next/server";
import { updateTask } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}));
  const task = await updateTask(params.id, body);
  return NextResponse.json({ task });
}
