import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { enabled } from "@/lib/env";
import { looksLikeSpam, rateLimit } from "@/lib/security";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/roles";
import { notifyMinistry, p } from "@/lib/email";

const schema = z.object({
  streamId: z.string().uuid(),
  body: z.string().trim().min(1).max(500),
  kind: z.enum(["chat", "prayer", "greeting", "testimony"]).default("chat"),
  guestName: z.string().trim().max(60).optional(),
  email: z.string().email().optional(),
});

export async function POST(req: Request) {
  if (!enabled.serviceRole) return NextResponse.json({ error: "Chat is not configured." }, { status: 503 });
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Message must be 1 to 500 characters." }, { status: 400 });
  const m = parsed.data;
  const { user, roles } = await getSession();
  const db = createAdminClient();

  // Prayer requests during a broadcast are private: they go to the prayer team, not the public chat.
  if (m.kind === "prayer") {
    if (!(await rateLimit("liveprayer", 5, 600, user?.id))) return NextResponse.json({ error: "Please wait before sending another request." }, { status: 429 });
    const name = (user?.user_metadata?.full_name as string) || m.guestName || "Live viewer";
    await db.from("prayer_requests").insert({ user_id: user?.id ?? null, name, email: user?.email ?? m.email ?? null, request: m.body, kind: "prayer", source: "live", stream_id: m.streamId });
    await notifyMinistry(`Live prayer request from ${name}`, p(m.body));
    return NextResponse.json({ ok: true, private: true });
  }

  if (!user) return NextResponse.json({ error: "Please sign in to chat." }, { status: 401 });
  const { data: stream } = await db.from("streams").select("status,chat_enabled").eq("id", m.streamId).maybeSingle();
  if (!stream?.chat_enabled || stream.status === "ended") return NextResponse.json({ error: "Chat is closed for this broadcast." }, { status: 403 });
  const { data: ban } = await db.from("chat_bans").select("user_id").eq("user_id", user.id).maybeSingle();
  if (ban) return NextResponse.json({ error: "You are not able to send messages." }, { status: 403 });
  const isMod = can(roles, "moderation");
  if (!isMod && !(await rateLimit("chat", 6, 20, user.id))) return NextResponse.json({ error: "Slow down a little, please." }, { status: 429 });
  if (!isMod && looksLikeSpam(m.body)) return NextResponse.json({ error: "Message blocked by spam filter." }, { status: 400 });

  const { error } = await db.from("chat_messages").insert({
    stream_id: m.streamId, user_id: user.id, body: m.body,
    display_name: (user.user_metadata?.full_name as string) || user.email?.split("@")[0] || "Member",
    kind: isMod && m.kind === "chat" ? "moderator" : m.kind,
  });
  if (error) return NextResponse.json({ error: "Could not send message." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
