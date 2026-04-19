import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";

let browserClient: SupabaseClient | null = null;
let serverClient: SupabaseClient | null = null;
let adminClient: SupabaseClient | null = null;

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

/**
 * Public (anon) client.
 * In the browser uses @supabase/ssr's createBrowserClient so sessions are
 * stored in cookies and readable by server components / route handlers.
 */
export function getDb(): SupabaseClient {
  if (typeof window !== "undefined") {
    if (!browserClient) {
      browserClient = createBrowserClient(
        requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
        requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
      ) as unknown as SupabaseClient;
    }
    return browserClient;
  }
  if (!serverClient) {
    serverClient = createClient(
      requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
      requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
      { auth: { persistSession: false } },
    );
  }
  return serverClient;
}

/** Service-role client — server only. Bypasses RLS. Use for ingestion jobs. */
export function getAdminDb(): SupabaseClient {
  if (typeof window !== "undefined") {
    throw new Error("Admin client cannot be used in the browser.");
  }
  if (!adminClient) {
    adminClient = createClient(
      requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
      requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
      { auth: { persistSession: false } },
    );
  }
  return adminClient;
}
