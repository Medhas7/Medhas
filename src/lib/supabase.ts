import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ─────────────────────────────────────────────────────────────────────────────
// Supabase access with automatic mock-mode fallback.
//
// SARATHI OS is designed to run with ZERO configuration. If the Supabase
// environment variables are missing, `isSupabaseConfigured()` returns false and
// the data store transparently uses the in-memory seeded dataset instead.
// ─────────────────────────────────────────────────────────────────────────────

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(url && anonKey);
}

/** Browser-safe client (anon key). Returns null in mock mode. */
export function getBrowserClient(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
}

/**
 * Server-side client. Prefers the service-role key for full table access in
 * API routes; falls back to the anon key. Returns null in mock mode.
 */
export function getServerClient(): SupabaseClient | null {
  if (!url) return null;
  const key = serviceKey || anonKey;
  if (!key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
