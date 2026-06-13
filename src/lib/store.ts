import { getServerClient, isSupabaseConfigured } from "./supabase";
import {
  SEED_AGENT_RUNS,
  SEED_DECISIONS,
  SEED_MEMORIES,
  SEED_NODES,
  SEED_PROJECTS,
  SEED_REVIEWS,
  SEED_TASKS,
} from "./seed";
import {
  AgentRun,
  DailyReview,
  Decision,
  LifeNode,
  Memory,
  Project,
  Task,
} from "./types";
import { nowISO, uid } from "./utils";

// ─────────────────────────────────────────────────────────────────────────────
// SARATHI OS — data store
//
// A single async interface over two backends:
//   • Supabase Postgres, when env vars are present.
//   • An in-memory seeded dataset, otherwise (mock mode).
//
// API routes call this exclusively, so swapping or extending the backend never
// touches the UI. The mock store is a module singleton, so mutations persist for
// the life of the server process (perfect for local development).
// ─────────────────────────────────────────────────────────────────────────────

export type StoreMode = "supabase" | "mock";

export function storeMode(): StoreMode {
  return isSupabaseConfigured() ? "supabase" : "mock";
}

// ── Mock singleton (deep-cloned so seed data is never mutated) ───────────────
interface MockDB {
  memories: Memory[];
  nodes: LifeNode[];
  projects: Project[];
  tasks: Task[];
  runs: AgentRun[];
  decisions: Decision[];
  reviews: DailyReview[];
}

const g = globalThis as unknown as { __sarathiMock?: MockDB };

function db(): MockDB {
  if (!g.__sarathiMock) {
    g.__sarathiMock = {
      memories: structuredClone(SEED_MEMORIES),
      nodes: structuredClone(SEED_NODES),
      projects: structuredClone(SEED_PROJECTS),
      tasks: structuredClone(SEED_TASKS),
      runs: structuredClone(SEED_AGENT_RUNS),
      decisions: structuredClone(SEED_DECISIONS),
      reviews: structuredClone(SEED_REVIEWS),
    };
  }
  return g.__sarathiMock;
}

// ── Memories ─────────────────────────────────────────────────────────────────
export async function listMemories(): Promise<Memory[]> {
  const sb = getServerClient();
  if (sb) {
    const { data, error } = await sb.from("memories").select("*").order("importance", { ascending: false });
    if (error) throw error;
    return (data as Memory[]) ?? [];
  }
  return [...db().memories].sort((a, b) => b.importance - a.importance);
}

export async function createMemory(input: Partial<Memory>): Promise<Memory> {
  const mem: Memory = {
    id: uid("mem"),
    type: input.type ?? "artifact",
    title: input.title ?? "Untitled memory",
    content: input.content ?? "",
    area: input.area ?? null,
    importance: clamp(input.importance ?? 5, 0, 10),
    confidence: clamp(input.confidence ?? 0.7, 0, 1),
    tags: input.tags ?? [],
    created_at: nowISO(),
    updated_at: nowISO(),
  };
  const sb = getServerClient();
  if (sb) {
    const { data, error } = await sb.from("memories").insert(mem).select().single();
    if (error) throw error;
    return data as Memory;
  }
  db().memories.unshift(mem);
  return mem;
}

export async function updateMemory(id: string, patch: Partial<Memory>): Promise<Memory> {
  const sb = getServerClient();
  if (sb) {
    const { data, error } = await sb
      .from("memories")
      .update({ ...patch, updated_at: nowISO() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as Memory;
  }
  const list = db().memories;
  const i = list.findIndex((m) => m.id === id);
  if (i === -1) throw new Error("Memory not found");
  list[i] = { ...list[i], ...patch, updated_at: nowISO() };
  return list[i];
}

export async function deleteMemory(id: string): Promise<void> {
  const sb = getServerClient();
  if (sb) {
    const { error } = await sb.from("memories").delete().eq("id", id);
    if (error) throw error;
    return;
  }
  db().memories = db().memories.filter((m) => m.id !== id);
}

// ── Nodes ──────────────────────────────────────────────────────────────────
export async function listNodes(): Promise<LifeNode[]> {
  const sb = getServerClient();
  if (sb) {
    const { data, error } = await sb.from("nodes").select("*").order("priority", { ascending: false });
    if (error) throw error;
    return (data as LifeNode[]) ?? [];
  }
  return [...db().nodes];
}

// ── Projects ─────────────────────────────────────────────────────────────────
export async function listProjects(): Promise<Project[]> {
  const sb = getServerClient();
  if (sb) {
    const { data, error } = await sb.from("projects").select("*").order("priority", { ascending: false });
    if (error) throw error;
    return (data as Project[]) ?? [];
  }
  return [...db().projects].sort((a, b) => b.priority - a.priority);
}

export async function getProject(id: string): Promise<Project | null> {
  const sb = getServerClient();
  if (sb) {
    const { data, error } = await sb.from("projects").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return (data as Project) ?? null;
  }
  return db().projects.find((p) => p.id === id) ?? null;
}

// ── Tasks ──────────────────────────────────────────────────────────────────
export async function listTasks(opts?: { projectId?: string; today?: boolean }): Promise<Task[]> {
  const sb = getServerClient();
  if (sb) {
    let q = sb.from("tasks").select("*").order("priority", { ascending: false });
    if (opts?.projectId) q = q.eq("project_id", opts.projectId);
    if (opts?.today) q = q.eq("is_today", true);
    const { data, error } = await q;
    if (error) throw error;
    return (data as Task[]) ?? [];
  }
  let list = [...db().tasks];
  if (opts?.projectId) list = list.filter((t) => t.project_id === opts.projectId);
  if (opts?.today) list = list.filter((t) => t.is_today);
  return list.sort((a, b) => b.priority - a.priority);
}

export async function createTask(input: Partial<Task>): Promise<Task> {
  const task: Task = {
    id: uid("task"),
    project_id: input.project_id ?? null,
    title: input.title ?? "Untitled task",
    notes: input.notes ?? "",
    status: input.status ?? "todo",
    priority: clamp(input.priority ?? 5, 0, 10),
    estimated_time: input.estimated_time ?? "",
    is_today: input.is_today ?? false,
    created_at: nowISO(),
  };
  const sb = getServerClient();
  if (sb) {
    const { data, error } = await sb.from("tasks").insert(task).select().single();
    if (error) throw error;
    return data as Task;
  }
  db().tasks.unshift(task);
  return task;
}

export async function updateTask(id: string, patch: Partial<Task>): Promise<Task> {
  const sb = getServerClient();
  if (sb) {
    const { data, error } = await sb.from("tasks").update(patch).eq("id", id).select().single();
    if (error) throw error;
    return data as Task;
  }
  const list = db().tasks;
  const i = list.findIndex((t) => t.id === id);
  if (i === -1) throw new Error("Task not found");
  list[i] = { ...list[i], ...patch };
  return list[i];
}

// ── Agent runs ───────────────────────────────────────────────────────────────
export async function listRuns(): Promise<AgentRun[]> {
  const sb = getServerClient();
  if (sb) {
    const { data, error } = await sb.from("agent_runs").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data as AgentRun[]) ?? [];
  }
  return [...db().runs].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function createRun(run: AgentRun): Promise<AgentRun> {
  const sb = getServerClient();
  if (sb) {
    const { data, error } = await sb.from("agent_runs").insert(run).select().single();
    if (error) throw error;
    return data as AgentRun;
  }
  db().runs.unshift(run);
  return run;
}

// ── Decisions ────────────────────────────────────────────────────────────────
export async function listDecisions(): Promise<Decision[]> {
  const sb = getServerClient();
  if (sb) {
    const { data, error } = await sb.from("decisions").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data as Decision[]) ?? [];
  }
  return [...db().decisions];
}

// ── Daily reviews ────────────────────────────────────────────────────────────
export async function listReviews(): Promise<DailyReview[]> {
  const sb = getServerClient();
  if (sb) {
    const { data, error } = await sb.from("daily_reviews").select("*").order("review_date", { ascending: false });
    if (error) throw error;
    return (data as DailyReview[]) ?? [];
  }
  return [...db().reviews].sort((a, b) => b.review_date.localeCompare(a.review_date));
}

export async function createReview(input: Partial<DailyReview>): Promise<DailyReview> {
  const review: DailyReview = {
    id: uid("rev"),
    review_date: input.review_date ?? nowISO().slice(0, 10),
    atma: score(input.atma),
    body: score(input.body),
    mind: score(input.mind),
    work: score(input.work),
    creativity: score(input.creativity),
    money: score(input.money),
    love: score(input.love),
    dharma: score(input.dharma),
    notes: input.notes ?? "",
    next_focus: input.next_focus ?? "",
    created_at: nowISO(),
  };
  const sb = getServerClient();
  if (sb) {
    const { data, error } = await sb.from("daily_reviews").insert(review).select().single();
    if (error) throw error;
    return data as DailyReview;
  }
  db().reviews.unshift(review);
  return review;
}

// ── helpers ──────────────────────────────────────────────────────────────────
function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
function score(n: number | undefined): number {
  return clamp(Math.round(n ?? 0), 0, 2);
}
