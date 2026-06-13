import { NextResponse } from "next/server";
import { createTask, listTasks } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId") ?? undefined;
  const today = searchParams.get("today") === "1" ? true : undefined;
  const tasks = await listTasks({ projectId, today });
  return NextResponse.json({ tasks });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (!body?.title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  const task = await createTask(body);
  return NextResponse.json({ task }, { status: 201 });
}
