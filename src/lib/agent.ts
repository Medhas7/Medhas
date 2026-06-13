import {
  AgentName,
  AgentResponse,
  Intent,
  Memory,
  RiskLevel,
  SuggestedAction,
} from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// SARATHI OS — the agent engine
//
// A deterministic, dependency-free intelligence core. It detects intent, routes
// to the right specialist agent, drafts a response grounded in the founder's
// memories, proposes actions, and — critically — enforces the permission law:
//
//   AI proposes. Kuldeep approves. Reality validates. Memory evolves.
//
// When a real model provider is wired (OpenAI / Anthropic / Gemini), this module
// becomes the orchestration layer that builds the prompt and post-processes the
// model's structured output. The interface stays identical.
// ─────────────────────────────────────────────────────────────────────────────

interface IntentRule {
  intent: Intent;
  agent: AgentName;
  node: string;
  keywords: string[];
}

// Ordered by specificity — first match wins, general is the fallback.
const INTENT_RULES: IntentRule[] = [
  {
    intent: "Medhas",
    agent: "Medhas Builder",
    node: "Medhas / AI Nalanda",
    keywords: ["medhas", "sarathi", "agent", "build", "ship", "code", "feature", "product", "venture", "dvinik", "sarvam", "evara", "saas", "engineer"],
  },
  {
    intent: "money",
    agent: "Money Operator",
    node: "Money / Money Engine",
    keywords: ["money", "cash", "revenue", "wealth", "invest", "income", "runway", "pricing", "budget", "finance", "profit", "sovereignty"],
  },
  {
    intent: "music",
    agent: "Creative Director",
    node: "Music / NushKala",
    keywords: ["music", "song", "compose", "practice", "rasa", "sound", "creative", "art", "nushkala", "perform"],
  },
  {
    intent: "knowledge",
    agent: "Knowledge Librarian",
    node: "Knowledge / AI Nalanda",
    keywords: ["learn", "study", "research", "knowledge", "nalanda", "synthesis", "book", "read", "understand", "map", "framework"],
  },
  {
    intent: "relationship",
    agent: "Relationship Steward",
    node: "Relationships",
    keywords: ["relationship", "love", "partner", "friend", "family", "people", "connection", "conflict", "trust"],
  },
  {
    intent: "health",
    agent: "Life Architect",
    node: "Body",
    keywords: ["body", "health", "sleep", "energy", "workout", "train", "breath", "diet", "fatigue", "recovery", "fitness"],
  },
  {
    intent: "life",
    agent: "Life Architect",
    node: "Being / Personal Mastery",
    keywords: ["life", "being", "atma", "ego", "dharma", "meditation", "sadhana", "purpose", "mind", "discipline", "mastery", "presence", "equanimity"],
  },
];

// Phrases that signal a non-autonomous, must-approve action class.
const CRITICAL_PATTERNS: { rx: RegExp; label: string }[] = [
  { rx: /\b(send|email|reply to|message)\b.*\b(email|mail|client|investor|person)\b/i, label: "sending an email" },
  { rx: /\b(spend|pay|buy|purchase|wire|transfer)\b/i, label: "spending money" },
  { rx: /\b(publish|post|tweet|release)\b/i, label: "publishing content" },
  { rx: /\b(delete|remove|wipe|drop)\b/i, label: "deleting data or files" },
  { rx: /\b(sign|contract|legal|sue|lawsuit)\b/i, label: "a legal decision" },
  { rx: /\b(medicine|medical|diagnos|prescri|dosage)\b/i, label: "a medical decision" },
  { rx: /\b(contact|call|reach out to)\b.*\b(person|people|someone|investor|client)\b/i, label: "contacting a person" },
];

const HIGH_PATTERNS: RegExp[] = [
  /\b(invest|allocate|commit budget|hire|fire|launch|quit)\b/i,
  /\b(important record|delete memory|change record)\b/i,
];

const MEDIUM_PATTERNS: RegExp[] = [
  /\b(schedule|plan|restructure|reprioritize|change routine|draft)\b/i,
];

function detectIntent(message: string): IntentRule {
  const m = message.toLowerCase();
  let best: { rule: IntentRule; score: number } | null = null;
  for (const rule of INTENT_RULES) {
    const score = rule.keywords.reduce((acc, kw) => (m.includes(kw) ? acc + 1 : acc), 0);
    if (score > 0 && (!best || score > best.score)) best = { rule, score };
  }
  return best?.rule ?? {
    intent: "general",
    agent: "Core Sarathi",
    node: "Being",
    keywords: [],
  };
}

function assessRisk(message: string): { risk: RiskLevel; reason: string | null } {
  for (const { rx, label } of CRITICAL_PATTERNS) {
    if (rx.test(message)) return { risk: "critical", reason: label };
  }
  for (const rx of HIGH_PATTERNS) {
    if (rx.test(message)) return { risk: "high", reason: "a high-impact, hard-to-reverse action" };
  }
  for (const rx of MEDIUM_PATTERNS) {
    if (rx.test(message)) return { risk: "medium", reason: "a change to plans or structure" };
  }
  return { risk: "safe", reason: null };
}

/** Score memories for relevance to the message (cheap lexical overlap). */
export function selectRelevantMemories(message: string, memories: Memory[], limit = 4): Memory[] {
  const words = new Set(
    message
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3),
  );
  return [...memories]
    .map((mem) => {
      const hay = `${mem.title} ${mem.content} ${mem.tags.join(" ")} ${mem.area ?? ""}`.toLowerCase();
      let overlap = 0;
      words.forEach((w) => {
        if (hay.includes(w)) overlap += 1;
      });
      // Importance always nudges core memories (mission, law) into context.
      const score = overlap * 2 + mem.importance / 5;
      return { mem, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.mem);
}

function buildActions(rule: IntentRule, risk: RiskLevel): SuggestedAction[] {
  const base: Record<Intent, SuggestedAction[]> = {
    Medhas: [
      { title: "Define the next Medhas build increment", priority: 9, estimated_time: "45 minutes" },
      { title: "Capture the decision as a project memory", priority: 6, estimated_time: "5 minutes" },
    ],
    money: [
      { title: "Map the relevant cashflow lever (no spending)", priority: 8, estimated_time: "30 minutes" },
      { title: "Log the money decision for approval", priority: 7, estimated_time: "10 minutes" },
    ],
    music: [
      { title: "Block a focused creative practice session", priority: 7, estimated_time: "60 minutes" },
      { title: "Record one rasa note in the Memory Vault", priority: 5, estimated_time: "5 minutes" },
    ],
    knowledge: [
      { title: "Add the concept to the AI Nalanda node map", priority: 8, estimated_time: "30 minutes" },
      { title: "Synthesize one insight as an artifact memory", priority: 6, estimated_time: "15 minutes" },
    ],
    relationship: [
      { title: "Name the relationship intention clearly", priority: 7, estimated_time: "15 minutes" },
      { title: "Decide the next caring action yourself", priority: 6, estimated_time: "10 minutes" },
    ],
    health: [
      { title: "Protect the body block in today's rhythm", priority: 8, estimated_time: "Realign now" },
      { title: "Note the energy signal in the review", priority: 5, estimated_time: "5 minutes" },
    ],
    life: [
      { title: "Anchor the 04:00–08:00 sadhana block", priority: 9, estimated_time: "90 minutes" },
      { title: "Sit with the question before acting", priority: 7, estimated_time: "10 minutes" },
    ],
    general: [
      { title: "Clarify the desired outcome in one sentence", priority: 6, estimated_time: "5 minutes" },
    ],
  };
  const actions = base[rule.intent] ?? base.general;
  // Anything beyond safe gets an explicit approval gate as the first action.
  if (risk !== "safe") {
    return [
      { title: "Review and approve before SARATHI proceeds", priority: 10, estimated_time: "2 minutes" },
      ...actions,
    ];
  }
  return actions;
}

function composeAnswer(
  message: string,
  rule: IntentRule,
  risk: RiskLevel,
  reason: string | null,
  memories: Memory[],
): string {
  const grounding = memories.length
    ? `Grounded in ${memories.length} of your memories (${memories.map((m) => `“${m.title}”`).join(", ")}), `
    : "";

  const lead: Record<Intent, string> = {
    Medhas: "On Medhas, the highest-leverage move is to make the next increment small, shippable, and reversible.",
    money: "On money, treat this as a sovereignty question first and a tactics question second — never automate the spend.",
    knowledge: "On knowledge, fold this into the AI Nalanda field so it compounds rather than scattering.",
    music: "On music, the goal is rasa, not output — protect the 08:00–12:00 creative window for it.",
    relationship: "On relationships, lead with presence and maturity; let the next caring action be yours to choose.",
    health: "On the body, energy is the substrate of every other node — realign the physical block before pushing harder.",
    life: "On Being, return to the witness first. Ego dissolution is the work; the rest is Prakriti unfolding.",
    general: "Here is the clearest next move I can see, held lightly for your judgment.",
  };

  let answer = `${grounding}${lead[rule.intent]}`;

  if (risk === "critical" && reason) {
    answer +=
      `\n\n⚠️ This touches ${reason}. By your core law, SARATHI will not do this autonomously. ` +
      `I've drafted the move and placed it behind an explicit approval gate — you decide, reality validates.`;
  } else if (risk === "high") {
    answer +=
      `\n\nThis is high-impact and hard to reverse, so it requires your explicit approval before anything proceeds.`;
  } else if (risk === "medium") {
    answer += `\n\nThis is a medium-risk change, so I've queued it for your confirmation rather than acting on it.`;
  } else {
    answer += `\n\nThis is safe to act on — your call on timing. AI proposes, you approve, memory evolves.`;
  }

  return answer;
}

export interface AgentEngineInput {
  message: string;
  memories: Memory[];
}

export interface AgentEngineResult extends AgentResponse {
  intent: Intent;
  memories_used: string[];
}

/** Run the local SARATHI engine over a message + memory context. */
export function runAgentEngine({ message, memories }: AgentEngineInput): AgentEngineResult {
  const rule = detectIntent(message);
  const { risk, reason } = assessRisk(message);
  const relevant = selectRelevantMemories(message, memories);
  const answer = composeAnswer(message, rule, risk, reason, relevant);
  const suggested = buildActions(rule, risk);

  const requires_approval = risk !== "safe";

  const memory_candidates = [
    {
      type: rule.intent === "Medhas" || rule.intent === "money" || rule.intent === "knowledge"
        ? ("project" as const)
        : ("decision" as const),
      content: `From a ${rule.agent} exchange: "${message.slice(0, 140)}"`,
    },
  ];

  return {
    detected_node: rule.node,
    agent_name: rule.agent,
    risk_level: risk,
    answer,
    suggested_actions: suggested,
    memory_candidates,
    requires_approval,
    intent: rule.intent,
    memories_used: relevant.map((m) => m.title),
  };
}
