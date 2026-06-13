import { NextResponse } from "next/server";
import { listProjects, listTasks } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const [projects, tasks] = await Promise.all([listProjects(), listTasks()]);
  return NextResponse.json({ projects, tasks });
}
