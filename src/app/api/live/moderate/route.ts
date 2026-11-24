import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/roles";

const schema = z.object({ action: z.enum(["hide", "unhide", "ban"]), messageId: z.string().uuid().optional(), userId: z.string().uuid().optional() });

/** Moderator actions. Uses the moderator's own session so RLS enforces permissions. */
export async function POST(req: Request) {
  const { user, roles, supabase } = await getSession();
  if (!user || !supabase || !can(roles, "moderation")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const { action, messageId, userId } = parsed.data;
  if ((action === "hide" || action === "unhide") && messageId) {
    const { error } = await supabase.from("chat_messages").update({ hidden: action === "hide" }).eq("id", messageId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (action === "ban" && userId) {
    const { error } = await supabase.from("chat_bans").upsert({ user_id: userId, banned_by: user.id, reason: "Live chat moderation" });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    await supabase.from("chat_messages").update({ hidden: true }).eq("user_id", userId);
  }
  return NextResponse.json({ ok: true });
}
