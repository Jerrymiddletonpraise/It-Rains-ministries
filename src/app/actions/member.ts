"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import type { ActionState } from "@/components/forms/ActionForm";

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

export async function updateProfile(_: ActionState, f: FormData): Promise<ActionState> {
  const { user, supabase } = await requireUser();
  const parsed = z.object({
    full_name: z.string().min(2).max(120), phone: z.string().max(40), country: z.string().max(80), city: z.string().max(80), bio: z.string().max(1000),
  }).safeParse({ full_name: str(f, "full_name"), phone: str(f, "phone"), country: str(f, "country"), city: str(f, "city"), bio: str(f, "bio") });
  if (!parsed.success) return { ok: false, message: "Please check your details." };
  const newsletter = f.get("newsletter_opt_in") === "on";
  const { error } = await supabase.from("profiles").update({ ...parsed.data, newsletter_opt_in: newsletter }).eq("id", user.id);
  if (error) return { ok: false, message: error.message };
  await supabase.auth.updateUser({ data: { full_name: parsed.data.full_name } });
  revalidatePath("/account");
  return { ok: true, message: "Profile updated." };
}

export async function cancelRegistration(f: FormData) {
  const { user, supabase } = await requireUser();
  await supabase.from("event_registrations").update({ status: "cancelled" }).eq("id", str(f, "id")).eq("user_id", user.id);
  revalidatePath("/account/events");
}

export async function joinGroup(f: FormData) {
  const { user, supabase } = await requireUser();
  await supabase.from("group_members").insert({ group_id: str(f, "group_id"), user_id: user.id });
  revalidatePath("/account/groups");
}

export async function leaveGroup(f: FormData) {
  const { user, supabase } = await requireUser();
  await supabase.from("group_members").delete().eq("group_id", str(f, "group_id")).eq("user_id", user.id);
  revalidatePath("/account/groups");
}

export async function postToGroup(_: ActionState, f: FormData): Promise<ActionState> {
  const { user, supabase } = await requireUser();
  const body = str(f, "body");
  if (body.length < 1 || body.length > 2000) return { ok: false, message: "Posts must be 1 to 2000 characters." };
  const groupId = str(f, "group_id");
  const { error } = await supabase.from("group_posts").insert({ group_id: groupId, user_id: user.id, body, author_name: (user.user_metadata?.full_name as string) || "Member" });
  if (error) return { ok: false, message: "Join the group to post." };
  revalidatePath(`/account/groups/${groupId}`);
  return { ok: true, message: "Posted." };
}
