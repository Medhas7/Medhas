# Deploying SARATHI OS to Vercel

This gets you a public URL (e.g. `sarathi-os.vercel.app`) you can open on any
device — phone included. It works in **mock mode** with zero configuration, and
you can add Supabase later for real persistence.

---

## Step 1 — Deploy (≈ 2 minutes)

1. Go to **[vercel.com](https://vercel.com)** and sign in with **GitHub**.
2. Click **Add New… → Project**.
3. Find and **Import** the `Medhas7/Medhas` repository.
4. On the configure screen:
   - **Framework Preset**: Next.js (auto-detected — leave it).
   - **Root Directory**: `./` (leave it).
   - **Branch**: select **`claude/sarathi-os-mvp-0zk4rc`**
     *(click "Edit" next to the production branch if it defaults to `main`).*
   - **Build & Output**: leave defaults (`npm run build`, output `.next`).
   - **Environment Variables**: leave empty for now → runs in mock mode.
5. Click **Deploy**. When it finishes you'll get a live URL.

That's it. Open the URL — it redirects to `/command` and the whole app works.

> **Tip:** to make `main` the deploy branch instead, merge this branch into
> `main` first (open a PR), then Vercel deploys `main` automatically on every push.

---

## Step 2 — Add Supabase for persistence (optional, later)

In **mock mode on Vercel**, data is in-memory per serverless instance, so new
memories/tasks/reviews you create won't reliably persist between requests. That's
fine for trying it out. For durable data:

1. Create a project at **[supabase.com](https://supabase.com)**.
2. **SQL editor** → paste and run [`supabase/schema.sql`](supabase/schema.sql).
3. In Supabase **Project Settings → API**, copy the URL and keys.
4. In **Vercel → your project → Settings → Environment Variables**, add:

   | Name                             | Value                          |
   | -------------------------------- | ------------------------------ |
   | `NEXT_PUBLIC_SUPABASE_URL`       | `https://xxxx.supabase.co`     |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | `eyJ...` (anon public key)     |
   | `SUPABASE_SERVICE_ROLE_KEY`      | `eyJ...` (service role secret) |

5. **Redeploy** (Deployments → ⋯ → Redeploy). The sidebar badge flips from
   **Mock mode** to **Supabase**, and all data now persists in Postgres.

---

## Step 3 — Wire a real AI model (optional, later)

The agent currently runs a deterministic local engine (no key needed). To use a
real model, add the relevant key in Vercel env vars and set the provider:

| Name                     | Value                          |
| ------------------------ | ------------------------------ |
| `ANTHROPIC_API_KEY`      | `sk-ant-...` (recommended)     |
| `SARATHI_MODEL_PROVIDER` | `anthropic`                    |

Then implement the provider branch in `src/lib/agent.ts` (see the
"Next steps for integrations" section in the README). The response contract
stays identical, so nothing else changes.

---

## Troubleshooting

- **Build fails** → confirm the selected branch is `claude/sarathi-os-mvp-0zk4rc`
  and the framework preset is Next.js. No env vars are required to build.
- **Wrong branch deployed** → Project → Settings → Git → set Production Branch.
- **Data resets** → expected in mock mode; add Supabase (Step 2) to persist.
