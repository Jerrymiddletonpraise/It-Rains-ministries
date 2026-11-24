import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { enabled } from "@/lib/env";
import { can, type Area, type Role } from "@/lib/roles";

export async function getSession() {
  if (!enabled.supabase) return { user: null, roles: [] as Role[], supabase: null };
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { user: null, roles: [] as Role[], supabase };
  const { data: rows } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
  return { user: data.user, roles: (rows ?? []).map((r) => r.role as Role), supabase };
}

export async function requireUser(next = "/account") {
  const s = await getSession();
  if (!s.user || !s.supabase) redirect(`/login?next=${encodeURIComponent(next)}`);
  return { ...s, user: s.user, supabase: s.supabase };
}

export async function requireArea(area: Area) {
  const s = await requireUser("/admin");
  if (!can(s.roles, area)) redirect("/admin?denied=1");
  return s;
}
