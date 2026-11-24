import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { viewerToken } from "@/lib/livekit";
import { enabled, env } from "@/lib/env";
import { rateLimit } from "@/lib/security";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  if (!enabled.livekit || !enabled.serviceRole) return NextResponse.json({ error: "Live streaming is not configured." }, { status: 503 });
  if (!(await rateLimit("lktoken", 30, 600))) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const { streamId } = await req.json().catch(() => ({}));
  if (typeof streamId !== "string") return NextResponse.json({ error: "Missing stream" }, { status: 400 });
  const { data: stream } = await createAdminClient().from("streams").select("room_name,status").eq("id", streamId).maybeSingle();
  if (!stream || !["live", "paused"].includes(stream.status)) return NextResponse.json({ error: "This broadcast is not live." }, { status: 404 });
  const { user } = await getSession();
  const token = await viewerToken(stream.room_name, `viewer-${user?.id ?? randomUUID()}`, (user?.user_metadata?.full_name as string) || "Guest");
  return NextResponse.json({ token, url: env.livekitUrl });
}
