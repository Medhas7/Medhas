-- ════════════════════════════════════════════════════════════════════════════
-- SARATHI OS — Supabase schema
--
-- Run this in the Supabase SQL editor (or `supabase db push`). It creates every
-- table the app uses, enables pgvector for future embeddings, applies a simple
-- owner-scoped RLS model, and seeds the founder's starting world.
--
-- The app runs in mock mode with ZERO setup; apply this only when you want a
-- live Postgres + Auth backend.
-- ════════════════════════════════════════════════════════════════════════════

-- ── Extensions ───────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";
-- pgvector: enable to store/search embeddings. Embeddings are stubbed in v1.
create extension if not exists "vector";

-- ── users ────────────────────────────────────────────────────────────────────
-- Mirrors auth.users; one row per founder-user. In single-user mode there is
-- exactly one row (Kuldeep).
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique,
  display_name text,
  created_at timestamptz not null default now()
);

-- ── memories ─────────────────────────────────────────────────────────────────
create table if not exists public.memories (
  id text primary key default ('mem_' || replace(gen_random_uuid()::text, '-', '')),
  user_id uuid references public.users (id) on delete cascade,
  type text not null check (type in (
    'identity','vision','project','decision','routine',
    'relationship','constraint','artifact','review'
  )),
  title text not null,
  content text not null default '',
  area text,
  importance int not null default 5 check (importance between 0 and 10),
  confidence numeric not null default 0.7 check (confidence between 0 and 1),
  tags text[] not null default '{}',
  -- pgvector-ready: 1536 dims (OpenAI) by default. Stubbed/null in v1.
  embedding vector(1536),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists memories_type_idx on public.memories (type);
create index if not exists memories_importance_idx on public.memories (importance desc);

-- ── nodes (Life Node Graph) ──────────────────────────────────────────────────
create table if not exists public.nodes (
  id text primary key default ('node_' || replace(gen_random_uuid()::text, '-', '')),
  user_id uuid references public.users (id) on delete cascade,
  name text not null,
  area text not null check (area in (
    'Being','Body','Mind','Knowledge','Music',
    'Medhas','Money','Relationships','Creativity','Dharma'
  )),
  parent_id text references public.nodes (id) on delete set null,
  description text not null default '',
  priority int not null default 5 check (priority between 0 and 10),
  impact int not null default 5 check (impact between 0 and 10),
  energy_cost int not null default 5 check (energy_cost between 0 and 10),
  status text not null default 'active' check (status in ('seed','active','thriving','dormant','blocked')),
  dharma_risk text not null default 'safe' check (dharma_risk in ('safe','medium','high','critical')),
  created_at timestamptz not null default now()
);

-- ── projects ─────────────────────────────────────────────────────────────────
create table if not exists public.projects (
  id text primary key default ('proj_' || replace(gen_random_uuid()::text, '-', '')),
  user_id uuid references public.users (id) on delete cascade,
  name text not null,
  area text not null,
  summary text not null default '',
  status text not null default 'idea' check (status in ('idea','active','paused','shipped','archived')),
  north_star text not null default '',
  priority int not null default 5 check (priority between 0 and 10),
  created_at timestamptz not null default now()
);

-- ── tasks ────────────────────────────────────────────────────────────────────
create table if not exists public.tasks (
  id text primary key default ('task_' || replace(gen_random_uuid()::text, '-', '')),
  user_id uuid references public.users (id) on delete cascade,
  project_id text references public.projects (id) on delete set null,
  title text not null,
  notes text not null default '',
  status text not null default 'todo' check (status in ('todo','doing','done','blocked')),
  priority int not null default 5 check (priority between 0 and 10),
  estimated_time text not null default '',
  is_today boolean not null default false,
  created_at timestamptz not null default now()
);

-- ── agent_runs ───────────────────────────────────────────────────────────────
create table if not exists public.agent_runs (
  id text primary key default ('run_' || replace(gen_random_uuid()::text, '-', '')),
  user_id uuid references public.users (id) on delete cascade,
  intent text not null,
  input text not null,
  detected_node text not null default '',
  agent_name text not null,
  risk_level text not null default 'safe' check (risk_level in ('safe','medium','high','critical')),
  answer text not null default '',
  suggested_actions jsonb not null default '[]',
  memory_candidates jsonb not null default '[]',
  memories_used text[] not null default '{}',
  requires_approval boolean not null default false,
  status text not null default 'completed' check (status in ('completed','awaiting_approval','approved','rejected','failed')),
  created_at timestamptz not null default now()
);

-- ── decisions ────────────────────────────────────────────────────────────────
create table if not exists public.decisions (
  id text primary key default ('dec_' || replace(gen_random_uuid()::text, '-', '')),
  user_id uuid references public.users (id) on delete cascade,
  title text not null,
  context text not null default '',
  choice text not null default '',
  risk_level text not null default 'safe' check (risk_level in ('safe','medium','high','critical')),
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

-- ── daily_reviews ────────────────────────────────────────────────────────────
create table if not exists public.daily_reviews (
  id text primary key default ('rev_' || replace(gen_random_uuid()::text, '-', '')),
  user_id uuid references public.users (id) on delete cascade,
  review_date date not null default current_date,
  atma int not null default 0 check (atma between 0 and 2),
  body int not null default 0 check (body between 0 and 2),
  mind int not null default 0 check (mind between 0 and 2),
  work int not null default 0 check (work between 0 and 2),
  creativity int not null default 0 check (creativity between 0 and 2),
  money int not null default 0 check (money between 0 and 2),
  love int not null default 0 check (love between 0 and 2),
  dharma int not null default 0 check (dharma between 0 and 2),
  notes text not null default '',
  next_focus text not null default '',
  created_at timestamptz not null default now()
);

-- ════════════════════════════════════════════════════════════════════════════
-- Row Level Security
--
-- Single-user, owner-scoped. Each row carries user_id; a user sees only theirs.
-- The server API route uses the service-role key and bypasses RLS, so seed data
-- with a null user_id is also readable in single-user setups.
-- ════════════════════════════════════════════════════════════════════════════
alter table public.memories enable row level security;
alter table public.nodes enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.agent_runs enable row level security;
alter table public.decisions enable row level security;
alter table public.daily_reviews enable row level security;

do $$
declare t text;
begin
  foreach t in array array['memories','nodes','projects','tasks','agent_runs','decisions','daily_reviews']
  loop
    execute format($f$
      drop policy if exists "owner_all" on public.%I;
      create policy "owner_all" on public.%I
        for all
        using (user_id is null or user_id = auth.uid())
        with check (user_id is null or user_id = auth.uid());
    $f$, t, t);
  end loop;
end $$;

-- ════════════════════════════════════════════════════════════════════════════
-- Seed data (user_id null = shared single-user world)
-- ════════════════════════════════════════════════════════════════════════════

insert into public.nodes (id, name, area, parent_id, description, priority, impact, energy_cost, status, dharma_risk) values
  ('node_being','Being','Being',null,'Atma-rootedness, presence, ego dissolution. The witness behind all action.',10,10,4,'active','safe'),
  ('node_body','Body','Body',null,'Vitality, strength, breath, the physical instrument of Prakriti.',9,8,6,'active','safe'),
  ('node_mind','Mind','Mind',null,'Buddhi clarity, focus, emotional regulation, equanimity.',9,9,5,'active','safe'),
  ('node_knowledge','Knowledge','Knowledge',null,'Synthesis, study, the AI Nalanda meta-knowledge field.',8,9,6,'active','safe'),
  ('node_music','Music','Music',null,'Creative mastery, rasa, expression through sound.',8,7,5,'active','safe'),
  ('node_medhas','Medhas','Medhas',null,'The intelligence engine and venture stack. The core build.',10,10,8,'thriving','medium'),
  ('node_money','Money','Money',null,'Wealth sovereignty, the money engine, resource freedom.',9,9,6,'active','medium'),
  ('node_relationships','Relationships','Relationships',null,'Love maturity, rasa, the people who matter.',8,8,4,'active','safe'),
  ('node_creativity','Creativity','Creativity',null,'Reality-serving creative expression across all mediums.',7,8,5,'active','safe'),
  ('node_dharma','Dharma','Dharma',null,'The governing law. Alignment of every action with right path.',10,10,3,'active','safe'),
  ('node_nalanda','AI Nalanda','Knowledge','node_knowledge','A meta-structured knowledge field — the modern Nalanda.',9,10,8,'seed','medium'),
  ('node_sadhana','Sadhana','Being','node_being','Daily 04:00–08:00 practice of meditation, breath, and discipline.',10,9,4,'active','safe')
on conflict (id) do nothing;

insert into public.projects (id, name, area, summary, status, north_star, priority) values
  ('proj_medhas','Medhas','Medhas','The intelligence engine — SARATHI OS and the agent stack that runs Kuldeep''s world.','active','A self-evolving personal intelligence OS.',10),
  ('proj_nalanda','AI Nalanda','Knowledge','A meta-structured knowledge field that organizes all learning into a living map.','idea','Reconstruct Nalanda as an AI-native knowledge field.',9),
  ('proj_evara','EVARA','Creativity','A creative / product venture in the EVARA line.','idea','An elegant brand that serves reality.',7),
  ('proj_sarvam','SARVAM','Knowledge','An everything-system: unification of tools, data, and intelligence.','idea','Wholeness — sarvam — across the stack.',7),
  ('proj_dvinik','Dvinik','Medhas','A focused venture under the Medhas umbrella.','idea','A sharp, defensible product wedge.',6),
  ('proj_nushkala','NushKala','Music','Music and creative-arts venture. Rasa expressed at scale.','idea','Art that moves people toward depth.',6),
  ('proj_money','Money Engine','Money','The system that produces wealth sovereignty and resource freedom.','active','Compounding, ethical, durable cashflow.',9),
  ('proj_mastery','Personal Mastery','Being','The lifelong program of body, mind, and Atma mastery.','active','An Atma-rooted, Prakriti-mastered instrument.',10)
on conflict (id) do nothing;

insert into public.tasks (id, project_id, title, notes, status, priority, estimated_time, is_today) values
  ('task_1','proj_medhas','Define SARATHI OS memory schema','Lock the eight memory types and importance/confidence model.','doing',9,'60 minutes',true),
  ('task_2','proj_medhas','Wire the /api/agent intent router','Deterministic local engine first; provider keys later.','todo',8,'45 minutes',true),
  ('task_3','proj_nalanda','Create AI Nalanda node map','Sketch the meta-structure of the knowledge field.','todo',9,'45 minutes',true),
  ('task_4','proj_money','Map current cashflow sources','Inputs, outputs, runway. No spending decisions automated.','todo',7,'30 minutes',false),
  ('task_5','proj_mastery','04:00 sadhana — non-negotiable','Meditation, breath, body. The day is won here.','todo',10,'90 minutes',true),
  ('task_6','proj_nushkala','One hour of focused music practice','08:00–12:00 creative window.','todo',6,'60 minutes',false)
on conflict (id) do nothing;

insert into public.memories (id, type, title, content, area, importance, confidence, tags) values
  ('mem_mission','identity','Root mission','Ego dissolution + Prakriti evolution / mastery / excellence.','Dharma',10,1,'{mission,core}'),
  ('mem_goal','vision','Life goal','To help Kuldeep become an Atma-rooted, Dharma-governed, Buddhi-guided, Prakriti-mastered, rasa-filled, power-capable, love-mature, wealth-sovereign, creatively expressed, reality-serving human instrument.','Being',10,1,'{vision,core}'),
  ('mem_law','constraint','Core law of operation','AI proposes. Kuldeep approves. Reality validates. Memory evolves.','Dharma',10,1,'{law,governance}'),
  ('mem_rhythm','routine','Daily rhythm','04:00–08:00 — Character/body/sadhana; 08:00–12:00 — Music/creative mastery; 12:00–16:00 — Medhas/build/money; 16:00–20:00 — Relationship/rasa/recovery; 20:00–22:00 — Review/study/sleep prep','Body',9,0.95,'{routine,rhythm}'),
  ('mem_nalanda','project','AI Nalanda intent','Kuldeep wants AI Nalanda to become a meta-structured knowledge field.','Knowledge',8,0.85,'{nalanda,knowledge}'),
  ('mem_medhas','project','Medhas as the engine','Medhas is the core intelligence engine; SARATHI OS is its command center.','Medhas',9,0.95,'{medhas}'),
  ('mem_money','decision','Money is sovereignty, not status','Wealth is pursued for sovereignty and freedom to serve reality, never status.','Money',8,0.9,'{money,values}'),
  ('mem_never','constraint','Never-autonomous actions','SARATHI must never autonomously send emails, spend money, publish content, delete files, or make legal/medical/financial decisions, or contact people.','Dharma',10,1,'{safety,permissions}')
on conflict (id) do nothing;

insert into public.decisions (id, title, context, choice, risk_level, approved) values
  ('dec_1','Adopt mock-first architecture','SARATHI OS must run with zero config so the founder can use it instantly.','Build a data store that falls back to an in-memory seeded dataset when Supabase env vars are absent.','safe',true)
on conflict (id) do nothing;
