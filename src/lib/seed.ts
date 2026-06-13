import {
  AgentRun,
  DailyReview,
  Decision,
  LifeNode,
  Memory,
  Project,
  Task,
} from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// SARATHI OS — seed dataset
//
// This is the founder's starting world: the root mission, the ten life nodes,
// the eight flagship projects, the daily rhythm, and the foundational memories.
// It powers mock mode and is the canonical reference for supabase/schema.sql.
// ─────────────────────────────────────────────────────────────────────────────

export const ROOT_MISSION =
  "Ego dissolution + Prakriti evolution / mastery / excellence.";

export const LIFE_GOAL =
  "To help Kuldeep become an Atma-rooted, Dharma-governed, Buddhi-guided, " +
  "Prakriti-mastered, rasa-filled, power-capable, love-mature, wealth-sovereign, " +
  "creatively expressed, reality-serving human instrument.";

export const CORE_LAW = [
  "AI proposes.",
  "Kuldeep approves.",
  "Reality validates.",
  "Memory evolves.",
];

export const DAILY_RHYTHM = [
  { window: "04:00–08:00", focus: "Character / body / sadhana", area: "Being" },
  { window: "08:00–12:00", focus: "Music / creative mastery", area: "Music" },
  { window: "12:00–16:00", focus: "Medhas / build / money", area: "Medhas" },
  { window: "16:00–20:00", focus: "Relationship / rasa / recovery", area: "Relationships" },
  { window: "20:00–22:00", focus: "Review / study / sleep prep", area: "Mind" },
] as const;

const T = "2026-06-13T05:00:00.000Z";

export const SEED_NODES: LifeNode[] = [
  { id: "node_being", name: "Being", area: "Being", parent_id: null, description: "Atma-rootedness, presence, ego dissolution. The witness behind all action.", priority: 10, impact: 10, energy_cost: 4, status: "active", dharma_risk: "safe", created_at: T },
  { id: "node_body", name: "Body", area: "Body", parent_id: null, description: "Vitality, strength, breath, the physical instrument of Prakriti.", priority: 9, impact: 8, energy_cost: 6, status: "active", dharma_risk: "safe", created_at: T },
  { id: "node_mind", name: "Mind", area: "Mind", parent_id: null, description: "Buddhi clarity, focus, emotional regulation, equanimity.", priority: 9, impact: 9, energy_cost: 5, status: "active", dharma_risk: "safe", created_at: T },
  { id: "node_knowledge", name: "Knowledge", area: "Knowledge", parent_id: null, description: "Synthesis, study, the AI Nalanda meta-knowledge field.", priority: 8, impact: 9, energy_cost: 6, status: "active", dharma_risk: "safe", created_at: T },
  { id: "node_music", name: "Music", area: "Music", parent_id: null, description: "Creative mastery, rasa, expression through sound.", priority: 8, impact: 7, energy_cost: 5, status: "active", dharma_risk: "safe", created_at: T },
  { id: "node_medhas", name: "Medhas", area: "Medhas", parent_id: null, description: "The intelligence engine and venture stack. The core build.", priority: 10, impact: 10, energy_cost: 8, status: "thriving", dharma_risk: "medium", created_at: T },
  { id: "node_money", name: "Money", area: "Money", parent_id: null, description: "Wealth sovereignty, the money engine, resource freedom.", priority: 9, impact: 9, energy_cost: 6, status: "active", dharma_risk: "medium", created_at: T },
  { id: "node_relationships", name: "Relationships", area: "Relationships", parent_id: null, description: "Love maturity, rasa, the people who matter.", priority: 8, impact: 8, energy_cost: 4, status: "active", dharma_risk: "safe", created_at: T },
  { id: "node_creativity", name: "Creativity", area: "Creativity", parent_id: null, description: "Reality-serving creative expression across all mediums.", priority: 7, impact: 8, energy_cost: 5, status: "active", dharma_risk: "safe", created_at: T },
  { id: "node_dharma", name: "Dharma", area: "Dharma", parent_id: null, description: "The governing law. Alignment of every action with right path.", priority: 10, impact: 10, energy_cost: 3, status: "active", dharma_risk: "safe", created_at: T },
  // A few sub-nodes to demonstrate hierarchy.
  { id: "node_nalanda", name: "AI Nalanda", area: "Knowledge", parent_id: "node_knowledge", description: "A meta-structured knowledge field — the modern Nalanda.", priority: 9, impact: 10, energy_cost: 8, status: "seed", dharma_risk: "medium", created_at: T },
  { id: "node_sadhana", name: "Sadhana", area: "Being", parent_id: "node_being", description: "Daily 04:00–08:00 practice of meditation, breath, and discipline.", priority: 10, impact: 9, energy_cost: 4, status: "active", dharma_risk: "safe", created_at: T },
];

export const SEED_PROJECTS: Project[] = [
  { id: "proj_medhas", name: "Medhas", area: "Medhas", summary: "The intelligence engine — SARATHI OS and the agent stack that runs Kuldeep's world.", status: "active", north_star: "A self-evolving personal intelligence OS.", priority: 10, created_at: T },
  { id: "proj_nalanda", name: "AI Nalanda", area: "Knowledge", summary: "A meta-structured knowledge field that organizes all learning into a living map.", status: "idea", north_star: "Reconstruct Nalanda as an AI-native knowledge field.", priority: 9, created_at: T },
  { id: "proj_evara", name: "EVARA", area: "Creativity", summary: "A creative / product venture in the EVARA line.", status: "idea", north_star: "An elegant brand that serves reality.", priority: 7, created_at: T },
  { id: "proj_sarvam", name: "SARVAM", area: "Knowledge", summary: "An everything-system: unification of tools, data, and intelligence.", status: "idea", north_star: "Wholeness — sarvam — across the stack.", priority: 7, created_at: T },
  { id: "proj_dvinik", name: "Dvinik", area: "Medhas", summary: "A focused venture under the Medhas umbrella.", status: "idea", north_star: "A sharp, defensible product wedge.", priority: 6, created_at: T },
  { id: "proj_nushkala", name: "NushKala", area: "Music", summary: "Music and creative-arts venture. Rasa expressed at scale.", status: "idea", north_star: "Art that moves people toward depth.", priority: 6, created_at: T },
  { id: "proj_money", name: "Money Engine", area: "Money", summary: "The system that produces wealth sovereignty and resource freedom.", status: "active", north_star: "Compounding, ethical, durable cashflow.", priority: 9, created_at: T },
  { id: "proj_mastery", name: "Personal Mastery", area: "Being", summary: "The lifelong program of body, mind, and Atma mastery.", status: "active", north_star: "An Atma-rooted, Prakriti-mastered instrument.", priority: 10, created_at: T },
];

export const SEED_TASKS: Task[] = [
  { id: "task_1", project_id: "proj_medhas", title: "Define SARATHI OS memory schema", notes: "Lock the eight memory types and importance/confidence model.", status: "doing", priority: 9, estimated_time: "60 minutes", is_today: true, created_at: T },
  { id: "task_2", project_id: "proj_medhas", title: "Wire the /api/agent intent router", notes: "Deterministic local engine first; provider keys later.", status: "todo", priority: 8, estimated_time: "45 minutes", is_today: true, created_at: T },
  { id: "task_3", project_id: "proj_nalanda", title: "Create AI Nalanda node map", notes: "Sketch the meta-structure of the knowledge field.", status: "todo", priority: 9, estimated_time: "45 minutes", is_today: true, created_at: T },
  { id: "task_4", project_id: "proj_money", title: "Map current cashflow sources", notes: "Inputs, outputs, runway. No spending decisions automated.", status: "todo", priority: 7, estimated_time: "30 minutes", is_today: false, created_at: T },
  { id: "task_5", project_id: "proj_mastery", title: "04:00 sadhana — non-negotiable", notes: "Meditation, breath, body. The day is won here.", status: "todo", priority: 10, estimated_time: "90 minutes", is_today: true, created_at: T },
  { id: "task_6", project_id: "proj_nushkala", title: "One hour of focused music practice", notes: "08:00–12:00 creative window.", status: "todo", priority: 6, estimated_time: "60 minutes", is_today: false, created_at: T },
];

export const SEED_MEMORIES: Memory[] = [
  { id: "mem_mission", type: "identity", title: "Root mission", content: ROOT_MISSION, area: "Dharma", importance: 10, confidence: 1, tags: ["mission", "core"], created_at: T, updated_at: T },
  { id: "mem_goal", type: "vision", title: "Life goal", content: LIFE_GOAL, area: "Being", importance: 10, confidence: 1, tags: ["vision", "core"], created_at: T, updated_at: T },
  { id: "mem_law", type: "constraint", title: "Core law of operation", content: CORE_LAW.join(" "), area: "Dharma", importance: 10, confidence: 1, tags: ["law", "governance"], created_at: T, updated_at: T },
  { id: "mem_rhythm", type: "routine", title: "Daily rhythm", content: DAILY_RHYTHM.map((r) => `${r.window} — ${r.focus}`).join("; "), area: "Body", importance: 9, confidence: 0.95, tags: ["routine", "rhythm"], created_at: T, updated_at: T },
  { id: "mem_nalanda", type: "project", title: "AI Nalanda intent", content: "Kuldeep wants AI Nalanda to become a meta-structured knowledge field.", area: "Knowledge", importance: 8, confidence: 0.85, tags: ["nalanda", "knowledge"], created_at: T, updated_at: T },
  { id: "mem_medhas", type: "project", title: "Medhas as the engine", content: "Medhas is the core intelligence engine; SARATHI OS is its command center.", area: "Medhas", importance: 9, confidence: 0.95, tags: ["medhas"], created_at: T, updated_at: T },
  { id: "mem_money", type: "decision", title: "Money is sovereignty, not status", content: "Wealth is pursued for sovereignty and freedom to serve reality, never status.", area: "Money", importance: 8, confidence: 0.9, tags: ["money", "values"], created_at: T, updated_at: T },
  { id: "mem_never", type: "constraint", title: "Never-autonomous actions", content: "SARATHI must never autonomously send emails, spend money, publish content, delete files, or make legal/medical/financial decisions, or contact people.", area: "Dharma", importance: 10, confidence: 1, tags: ["safety", "permissions"], created_at: T, updated_at: T },
];

export const SEED_AGENT_RUNS: AgentRun[] = [
  {
    id: "run_1",
    intent: "Medhas",
    input: "What is the highest-leverage move on Medhas this week?",
    detected_node: "Medhas / AI Nalanda",
    agent_name: "Medhas Builder",
    risk_level: "safe",
    answer:
      "Lock the SARATHI OS memory schema first — every other agent depends on a stable memory substrate. Once the eight memory types and the importance/confidence model are fixed, the intent router and node graph compose cleanly on top.",
    suggested_actions: [
      { title: "Create AI Nalanda node map", priority: 9, estimated_time: "45 minutes" },
      { title: "Lock memory schema", priority: 10, estimated_time: "60 minutes" },
    ],
    memory_candidates: [
      { type: "project", content: "Kuldeep wants AI Nalanda to become a meta-structured knowledge field." },
    ],
    requires_approval: false,
    status: "completed",
    memories_used: ["Medhas as the engine", "AI Nalanda intent"],
    created_at: T,
  },
];

export const SEED_DECISIONS: Decision[] = [
  {
    id: "dec_1",
    title: "Adopt mock-first architecture",
    context: "SARATHI OS must run with zero config so the founder can use it instantly.",
    choice: "Build a data store that falls back to an in-memory seeded dataset when Supabase env vars are absent.",
    risk_level: "safe",
    approved: true,
    created_at: T,
  },
];

export const SEED_REVIEWS: DailyReview[] = [
  {
    id: "rev_1",
    review_date: "2026-06-12",
    atma: 2,
    body: 1,
    mind: 2,
    work: 2,
    creativity: 1,
    money: 1,
    love: 2,
    dharma: 2,
    notes: "Strong sadhana morning. Build momentum on Medhas. Music slipped.",
    next_focus: "Protect the 08:00–12:00 music window. Ship the agent router.",
    created_at: T,
  },
];
