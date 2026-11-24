import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/** Service-role client. Bypasses RLS — only use in trusted server code (webhooks, rate-limited routes). */
export function createAdminClient() {
  if (!env.supabaseServiceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  return createClient(env.supabaseUrl, env.supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
