import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { enabled } from "@/lib/env";
import { rateLimit } from "@/lib/security";
import { getSession } from "@/lib/auth";

const schema = z.object({ endpoint: z.string().url().max(1000), keys: z.object({ p256dh: z.string().max(200), auth: z.string().max(100) }) });

export async function POST(req: Request) {
  if (!enabled.serviceRole) return NextResponse.json({ error: "Not configured" }, { status: 503 });
  if (!(await rateLimit("push", 10, 3600))) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  const { user } = await getSession();
  await createAdminClient().from("push_subscriptions").upsert({ endpoint: parsed.data.endpoint, p256dh: parsed.data.keys.p256dh, auth: parsed.data.keys.auth, user_id: user?.id ?? null }, { onConflict: "endpoint" });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { endpoint } = await req.json().catch(() => ({}));
  if (typeof endpoint === "string" && enabled.serviceRole) await createAdminClient().from("push_subscriptions").delete().eq("endpoint", endpoint);
  return NextResponse.json({ ok: true });
}
