// ─────────────────────────────────────────────────────────────────────────────
// SARATHI OS — core domain types
//
// These types are the single source of truth shared by the data store, the
// API routes, the agent engine, and the UI. Keep them aligned with
// supabase/schema.sql.
// ─────────────────────────────────────────────────────────────────────────────

export type LifeArea =
  | "Being"
  | "Body"
  | "Mind"
  | "Knowledge"
  | "Music"
  | "Medhas"
  | "Money"
  | "Relationships"
  | "Creativity"
  | "Dharma";

export const LIFE_AREAS: LifeArea[] = [
  "Being",
  "Body",
  "Mind",
  "Knowledge",
  "Music",
  "Medhas",
  "Money",
  "Relationships",
  "Creativity",
  "Dharma",
];

export type MemoryType =
  | "identity"
  | "vision"
  | "project"
  | "decision"
  | "routine"
  | "relationship"
  | "constraint"
  | "artifact"
  | "review";

export const MEMORY_TYPES: MemoryType[] = [
  "identity",
  "vision",
  "project",
  "decision",
  "routine",
  "relationship",
  "constraint",
  "artifact",
  "review",
];

export type NodeStatus = "seed" | "active" | "thriving" | "dormant" | "blocked";
export type ProjectStatus = "idea" | "active" | "paused" | "shipped" | "archived";
export type TaskStatus = "todo" | "doing" | "done" | "blocked";
export type RiskLevel = "safe" | "medium" | "high" | "critical";
export type AgentStatus = "completed" | "awaiting_approval" | "approved" | "rejected" | "failed";

export type Intent =
  | "life"
  | "Medhas"
  | "money"
  | "music"
  | "knowledge"
  | "relationship"
  | "health"
  | "general";

export type AgentName =
  | "Core Sarathi"
  | "Life Architect"
  | "Medhas Builder"
  | "Knowledge Librarian"
  | "Money Operator"
  | "Creative Director"
  | "Relationship Steward"
  | "Researcher"
  | "Code Builder";

export interface Memory {
  id: string;
  type: MemoryType;
  title: string;
  content: string;
  area: LifeArea | null;
  importance: number; // 0–10
  confidence: number; // 0–1
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface LifeNode {
  id: string;
  name: string;
  area: LifeArea;
  parent_id: string | null;
  description: string;
  priority: number; // 0–10
  impact: number; // 0–10
  energy_cost: number; // 0–10
  status: NodeStatus;
  dharma_risk: RiskLevel;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  area: LifeArea;
  summary: string;
  status: ProjectStatus;
  north_star: string;
  priority: number; // 0–10
  created_at: string;
}

export interface Task {
  id: string;
  project_id: string | null;
  title: string;
  notes: string;
  status: TaskStatus;
  priority: number; // 0–10
  estimated_time: string;
  is_today: boolean;
  created_at: string;
}

export interface SuggestedAction {
  title: string;
  priority: number;
  estimated_time: string;
}

export interface MemoryCandidate {
  type: MemoryType;
  content: string;
}

export interface AgentResponse {
  detected_node: string;
  agent_name: AgentName;
  risk_level: RiskLevel;
  answer: string;
  suggested_actions: SuggestedAction[];
  memory_candidates: MemoryCandidate[];
  requires_approval: boolean;
}

export interface AgentRun extends AgentResponse {
  id: string;
  intent: Intent;
  input: string;
  status: AgentStatus;
  memories_used: string[]; // memory titles referenced
  created_at: string;
}

export interface Decision {
  id: string;
  title: string;
  context: string;
  choice: string;
  risk_level: RiskLevel;
  approved: boolean;
  created_at: string;
}

export interface DailyReview {
  id: string;
  review_date: string; // YYYY-MM-DD
  atma: number; // 0–2
  body: number;
  mind: number;
  work: number;
  creativity: number;
  money: number;
  love: number;
  dharma: number;
  notes: string;
  next_focus: string;
  created_at: string;
}

export const REVIEW_DIMENSIONS = [
  "atma",
  "body",
  "mind",
  "work",
  "creativity",
  "money",
  "love",
  "dharma",
] as const;

export type ReviewDimension = (typeof REVIEW_DIMENSIONS)[number];
