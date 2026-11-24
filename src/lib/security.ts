import "server-only";
import { headers } from "next/headers";
import { createHash } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { env, enabled } from "@/lib/env";

export async function clientIp() {
  const h = await headers();
  return (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "unknown").trim();
}

function hash(s: string) {
  return createHash("sha256").update(s + (env.supabaseServiceKey.slice(-12) || "irm")).digest("hex").slice(0, 32);
}

/**
 * Sliding-window rate limit stored in Postgres (works across serverless instances).
 * Returns true when the request is allowed.
 */
export async function rateLimit(scope: string, limit: number, windowSeconds: number, identity?: string) {
  if (!enabled.serviceRole) return true;
  const bucket = `${scope}:${hash(identity ?? (await clientIp()))}`;
  const db = createAdminClient();
  const since = new Date(Date.now() - windowSeconds * 1000).toISOString();
  const { count } = await db.from("rate_limit_hits").select("id", { count: "exact", head: true }).eq("bucket", bucket).gte("created_at", since);
  if ((count ?? 0) >= limit) return false;
  await db.from("rate_limit_hits").insert({ bucket });
  // opportunistic cleanup
  if (Math.random() < 0.02) await db.from("rate_limit_hits").delete().lt("created_at", new Date(Date.now() - 86400_000).toISOString());
  return true;
}

/** Verifies a Cloudflare Turnstile token when Turnstile is configured. */
export async function verifyHuman(token?: string | null) {
  if (!enabled.turnstile) return true;
  if (!token) return false;
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: new URLSearchParams({ secret: env.turnstileSecret, response: token, remoteip: await clientIp() }),
  });
  const data = (await res.json()) as { success: boolean };
  return data.success;
}

const BLOCKED = /(viagra|casino|crypto ?giveaway|forex signal|bit\.ly|onlyfans|porn|xxx)/i;
export function looksLikeSpam(text: string) {
  const links = (text.match(/https?:\/\//g) ?? []).length;
  return BLOCKED.test(text) || links > 2 || /(.)\1{15,}/.test(text);
}

/** Honeypot + Turnstile + rate limit in one call for public forms. */
export async function guardForm(form: FormData, scope: string, limit = 5, windowSeconds = 600) {
  if (String(form.get("website") ?? "").length > 0) return "Submission rejected.";
  if (!(await verifyHuman(form.get("cf-turnstile-response") as string | null))) return "Please complete the verification check.";
  if (!(await rateLimit(scope, limit, windowSeconds))) return "Too many submissions. Please wait a few minutes and try again.";
  return null;
}
