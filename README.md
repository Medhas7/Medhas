# SARATHI OS

> A private personal intelligence operating system for one founder-user, **Kuldeep**.
> Not a chatbot — a command center for life mastery, Medhas building, knowledge
> synthesis, money execution, music/creative work, and daily review.

**Core mission** — Ego dissolution + Prakriti evolution / mastery / excellence.

### ▶ Get a live URL in one click

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FMedhas7%2FMedhas%2Ftree%2Fclaude%2Fsarathi-os-mvp-0zk4rc&project-name=sarathi-os&repository-name=sarathi-os)

Tap the button → sign in with GitHub → **Deploy**. Vercel gives you a public URL
(e.g. `sarathi-os.vercel.app`) that works on any device. No keys needed — it runs
in mock mode. Full walkthrough in [`DEPLOY.md`](DEPLOY.md).

**Core law**

```
AI proposes.
Kuldeep approves.
Reality validates.
Memory evolves.
```

---

## Why this exists

SARATHI OS is the founder's instrument for becoming an Atma-rooted,
Dharma-governed, Buddhi-guided, Prakriti-mastered, rasa-filled, power-capable,
love-mature, wealth-sovereign, creatively expressed, reality-serving human
instrument. Every surface in the app serves that single arc.

It runs **with zero configuration**. With no Supabase keys present it boots into
**mock mode** — a fully seeded in-memory world — so you can use the entire
product offline. Add Supabase env vars and it switches to a live
Postgres + Auth backend with no code changes.

---

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** + **shadcn/ui**-style components (hand-built, no runtime lock-in)
- **Supabase** Postgres + Auth, **pgvector-ready** schema (embeddings stubbed in v1)
- API routes for all agent calls and CRUD
- Mobile-first responsive UI with a founder-grade dark theme
- **Local mock mode** when Supabase env vars are absent

---

## Quick start

```bash
# 1. Install
npm install

# 2. Run — works immediately in mock mode (no env vars needed)
npm run dev
# → http://localhost:3000  (redirects to /command)
```

That's it. The app is fully usable against the seeded mock dataset.

### Production build

```bash
npm run build
npm run start
npm run typecheck   # tsc --noEmit
npm run lint
```

---

## Going live with Supabase (optional)

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL editor** and run [`supabase/schema.sql`](supabase/schema.sql).
   It creates every table, enables `pgvector`, applies owner-scoped RLS, and
   seeds the founder's starting world (nodes, projects, tasks, memories).
3. Copy `.env.example` → `.env.local` and fill in:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...        # server-only, never exposed
   ```

4. Restart. The mode badge in the sidebar flips from **Mock mode** to
   **Supabase**, and all reads/writes now hit Postgres.

> The detection is automatic: `isSupabaseConfigured()` in
> `src/lib/supabase.ts` keys off the presence of the URL + anon key.

---

## Screens

| Route        | Screen            | What it does                                                              |
| ------------ | ----------------- | ------------------------------------------------------------------------ |
| `/command`   | Command Center    | Chat with SARATHI; shows detected node, specialist agent, memories used  |
| `/today`     | Today Cockpit     | Top-3 priorities, the daily rhythm blocks, ritual checklist, quick-add   |
| `/nodes`     | Life Node Graph   | The ten life areas as hierarchical nodes with priority/impact/energy     |
| `/projects`  | Projects          | The eight flagship ventures; click into per-project task detail          |
| `/memory`    | Memory Vault      | CRUD memories across nine types, importance/confidence, search & filter  |
| `/review`    | Daily Review      | Score eight dimensions 0–2, notes, next-day focus, saved history         |
| `/runs`      | Agent Runs        | Every agent call logged: input, output, risk, status, time              |
| `/settings`  | Settings          | Provider selector, API-key placeholder, permission rules, privacy        |

---

## The agent — `/api/agent`

A single `POST` endpoint is SARATHI's intelligence entry point. It:

1. Receives the user message.
2. Loads relevant memories (Supabase or mock) and ranks them by lexical overlap
   + importance.
3. **Detects intent** → `life · Medhas · money · music · knowledge · relationship · health · general`.
4. **Chooses the specialist agent** → `Core Sarathi · Life Architect · Medhas Builder ·
   Knowledge Librarian · Money Operator · Creative Director · Relationship Steward ·
   Researcher · Code Builder`.
5. **Assesses risk** and the permission gate.
6. Returns the structured contract and **persists the run**.

### Response contract

```json
{
  "detected_node": "Medhas / AI Nalanda",
  "agent_name": "Medhas Builder",
  "risk_level": "safe",
  "answer": "Here is the recommended next move...",
  "suggested_actions": [
    { "title": "Create AI Nalanda node map", "priority": 9, "estimated_time": "45 minutes" }
  ],
  "memory_candidates": [
    { "type": "project", "content": "Kuldeep wants AI Nalanda to become a meta-structured knowledge field." }
  ],
  "requires_approval": false
}
```

The engine (`src/lib/agent.ts`) is **deterministic and dependency-free** — it
needs no API key to run. When you wire a model provider, that module becomes the
orchestration layer (prompt-build + structured-output post-processing); the
contract stays identical.

### Permission law (enforced in the engine)

- **Safe** actions can be automatic.
- **Medium**-risk actions need confirmation.
- **High**-risk actions need explicit approval.
- **Critical** actions must never be autonomous.

SARATHI will **never autonomously**: send emails · spend money · publish content ·
delete files · make legal / medical / financial decisions · contact people ·
change important records. These are detected from the message and forced behind
an explicit approval gate (`requires_approval: true`, `risk_level: "critical"`).

---

## Database tables

`users · memories · nodes · projects · tasks · agent_runs · decisions · daily_reviews`

All defined in [`supabase/schema.sql`](supabase/schema.sql) with check
constraints, indexes, RLS, and seed data. The `memories.embedding vector(1536)`
column is **pgvector-ready** for v2 semantic recall (stubbed/null in v1).

---

## Folder structure

```
.
├── README.md
├── package.json
├── next.config.mjs · tsconfig.json · tailwind.config.ts · postcss.config.mjs
├── components.json                 # shadcn/ui config
├── .env.example
├── supabase/
│   └── schema.sql                  # full schema + RLS + seed
└── src/
    ├── app/
    │   ├── layout.tsx · globals.css · page.tsx
    │   ├── command/  today/  nodes/  projects/  memory/  review/  runs/  settings/
    │   └── api/
    │       ├── agent/route.ts      # the intelligence entry point
    │       ├── health/route.ts     # reports mock vs supabase mode
    │       ├── memories/  tasks/  reviews/  runs/  nodes/  projects/
    ├── components/
    │   ├── ui/                      # button, card, input, textarea, badge, select, label
    │   ├── sidebar.tsx · topbar.tsx · mobile-nav.tsx
    │   ├── mode-badge.tsx · common.tsx
    └── lib/
        ├── types.ts                # the shared domain model
        ├── agent.ts                # deterministic agent engine
        ├── store.ts                # data access: Supabase ⟷ mock
        ├── supabase.ts             # client + mock-mode detection
        ├── seed.ts                 # the founder's seeded world
        ├── nav.ts · utils.ts
```

---

## Seeded world

- **Root mission**: Ego dissolution + Prakriti evolution / mastery / excellence.
- **Daily rhythm**: 04–08 sadhana · 08–12 music · 12–16 Medhas/money ·
  16–20 relationship/recovery · 20–22 review/sleep.
- **Ten nodes**: Being, Body, Mind, Knowledge, Music, Medhas, Money,
  Relationships, Creativity, Dharma (+ AI Nalanda and Sadhana sub-nodes).
- **Eight projects**: Medhas, AI Nalanda, EVARA, SARVAM, Dvinik, NushKala,
  Money Engine, Personal Mastery.
- Foundational memories for mission, vision, the core law, and the
  never-autonomous constraints.

---

## Next steps for integrations

1. **Real models** — In `src/lib/agent.ts`, branch on `SARATHI_MODEL_PROVIDER`
   and the provider key. Build the prompt from `selectRelevantMemories(...)`,
   request structured output matching `AgentResponse`, and keep the
   deterministic engine as the fallback. The latest Claude models
   (Anthropic) are the recommended default for the agent layer.
2. **Embeddings / semantic recall** — Populate `memories.embedding`, swap the
   lexical ranker in `selectRelevantMemories` for a pgvector similarity query.
3. **Auth** — Wire Supabase Auth (single-user) and stamp `user_id` on writes;
   RLS is already in place.
4. **Approval workflow** — Turn `requires_approval` runs into an inbox: approve →
   execute the suggested action, write the `decision`, evolve memory.
5. **Memory evolution** — Promote `memory_candidates` from agent runs into the
   Memory Vault with a review step.

---

## Privacy

SARATHI OS is a private instrument for one person. Memories, reviews, and
decisions are deeply personal. Never commit secrets; keep live keys in
environment variables. When a model provider is connected, your messages and
memory context are sent to that provider — review their data policy first.
