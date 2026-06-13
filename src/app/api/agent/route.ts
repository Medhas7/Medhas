import { NextResponse } from "next/server";
import { runAgentEngine } from "@/lib/agent";
import { createRun, listMemories, storeMode } from "@/lib/store";
import { AgentRun } from "@/lib/types";
import { nowISO, uid } from "@/lib/utils";

export const dynamic = "force-dynamic";

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/agent
//
// The single entry point to SARATHI's intelligence.
//   1. Receive the user message.
//   2. Load relevant memories (Supabase or mock).
//   3. Detect intent → choose the specialist agent.
//   4. Assess risk and the permission gate.
//   5. Return the structured response contract.
//   6. Persist the run.
//
// A real model provider can be slotted in at step 3–4 without changing the
// contract; the deterministic engine is the default and the fallback.
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  let message = "";
  try {
    const body = await req.json();
    message = typeof body?.message === "string" ? body.message.trim() : "";
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!message) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  // Load the memory context the agent will reason over.
  const memories = await listMemories();

  // Run the engine (local, deterministic, dependency-free).
  const result = runAgentEngine({ message, memories });

  // Determine run status from the permission gate.
  const status = result.requires_approval ? ("awaiting_approval" as const) : ("completed" as const);

  const run: AgentRun = {
    id: uid("run"),
    intent: result.intent,
    input: message,
    detected_node: result.detected_node,
    agent_name: result.agent_name,
    risk_level: result.risk_level,
    answer: result.answer,
    suggested_actions: result.suggested_actions,
    memory_candidates: result.memory_candidates,
    requires_approval: result.requires_approval,
    memories_used: result.memories_used,
    status,
    created_at: nowISO(),
  };

  // Persist (Supabase if connected, mock otherwise).
  try {
    await createRun(run);
  } catch (err) {
    // Persistence is best-effort; never block the user's answer on it.
    console.error("Failed to persist agent run:", err);
  }

  return NextResponse.json({
    run,
    mode: storeMode(),
    // The canonical structured response contract:
    response: {
      detected_node: result.detected_node,
      agent_name: result.agent_name,
      risk_level: result.risk_level,
      answer: result.answer,
      suggested_actions: result.suggested_actions,
      memory_candidates: result.memory_candidates,
      requires_approval: result.requires_approval,
    },
  });
}
