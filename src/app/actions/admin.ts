"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireArea, requireUser } from "@/lib/auth";
import { ENTITIES, type FieldDef } from "@/lib/admin-entities";
import { slugify } from "@/lib/utils";
import type { ActionState } from "@/components/forms/ActionForm";

function parseField(f: FieldDef, form: FormData) {
  const raw = form.get(f.name);
  switch (f.type) {
    case "bool": return raw === "on";
    case "number": return raw === null || raw === "" ? null : Number(raw);
    case "list": return String(raw ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
    case "datetime": {
      if (!raw) return null;
      // value is local wall time in the form's chosen zone offset, sent as ISO by the client
      const iso = String(form.get(`${f.name}__iso`) ?? "");
      return iso || new Date(String(raw)).toISOString();
    }
    case "date": return raw ? String(raw) : null;
    default: { const v = String(raw ?? "").trim(); return v === "" ? null : v; }
  }
}

export async function saveEntity(entityKey: string, id: string | null, _: ActionState, form: FormData): Promise<ActionState> {
  const def = ENTITIES[entityKey];
  if (!def) return { ok: false, message: "Unknown section" };
  const { supabase, user } = await requireArea(def.area);
  const row: Record<string, unknown> = {};
  for (const f of def.fields) {
    const v = parseField(f, form);
    if (f.required && (v === null || v === "")) return { ok: false, message: `${f.label} is required.` };
    row[f.name] = v;
  }
  if (def.slugFrom && !id) row.slug = `${slugify(String(row[def.slugFrom]))}-${Math.random().toString(36).slice(2, 6)}`;
  if (!id && ["media_items", "events", "announcements"].includes(def.table)) row.created_by = user.id;
  if (def.table === "departments" && !row.summary) row.summary = "";
  const q = id ? supabase.from(def.table).update(row).eq("id", id) : supabase.from(def.table).insert(row);
  const { error } = await q;
  if (error) return { ok: false, message: error.message };
  revalidatePath("/", "layout");
  if (!id) redirect(`/admin/${entityKey}?saved=1`);
  return { ok: true, message: "Saved." };
}

export async function deleteEntity(form: FormData) {
  const def = ENTITIES[String(form.get("entity"))];
  if (!def) return;
  const { supabase } = await requireArea(def.area);
  await supabase.from(def.table).delete().eq("id", String(form.get("id")));
  revalidatePath("/", "layout");
  redirect(`/admin/${String(form.get("entity"))}?deleted=1`);
}

// ---------------------------------------------------------------- prayer
import { sendEmail, p } from "@/lib/email";

export async function updatePrayer(_: ActionState, form: FormData): Promise<ActionState> {
  const { supabase, user } = await requireArea("prayer");
  const id = String(form.get("id"));
  const response = String(form.get("response") ?? "").trim();
  const status = String(form.get("status") ?? "praying");
  const notes = String(form.get("internal_notes") ?? "").trim();
  const sendReply = form.get("send_reply") === "on";
  const update: Record<string, unknown> = { status, internal_notes: notes || null, assigned_to: user.id };
  if (response) { update.response = response; update.responded_at = new Date().toISOString(); if (status === "new" || status === "praying") update.status = "responded"; }
  const { data: row, error } = await supabase.from("prayer_requests").update(update).eq("id", id).select("name,email").single();
  if (error) return { ok: false, message: error.message };
  let note = "";
  if (sendReply && response) {
    if (!row.email) note = " No email on file, reply was saved but not emailed.";
    else {
      const r = await sendEmail({ to: row.email, subject: "A word from the IT RAINS MINISTRIES prayer team", html: p(`Dear ${row.name},`) + p(response) + p("We continue to stand with you in prayer.\nIT RAINS MINISTRIES") });
      note = r.sent ? " Reply emailed." : ` Email not sent: ${r.reason}.`;
    }
  }
  revalidatePath("/admin/prayer");
  return { ok: true, message: `Updated.${note}` };
}

// ---------------------------------------------------------------- testimonies
export async function reviewTestimony(form: FormData) {
  const { supabase, user } = await requireArea("testimonies");
  const status = String(form.get("status"));
  if (!["approved", "rejected", "pending"].includes(status)) return;
  const id = String(form.get("id"));
  if (status === "approved") {
    const { data } = await supabase.from("testimonies").select("consent_to_publish").eq("id", id).single();
    if (!data?.consent_to_publish) return; // never publish without consent
  }
  await supabase.from("testimonies").update({ status, reviewed_by: user.id }).eq("id", id);
  revalidatePath("/admin/testimonies"); revalidatePath("/testimonies"); revalidatePath("/");
}

export async function deleteTestimony(form: FormData) {
  const { supabase } = await requireArea("testimonies");
  await supabase.from("testimonies").delete().eq("id", String(form.get("id")));
  revalidatePath("/admin/testimonies");
}

// ---------------------------------------------------------------- messages
export async function setMessageStatus(form: FormData) {
  const { supabase } = await requireArea("messages");
  await supabase.from("contact_messages").update({ status: String(form.get("status")) }).eq("id", String(form.get("id")));
  revalidatePath("/admin/messages");
}

// ---------------------------------------------------------------- registrations
export async function setRegistrationStatus(form: FormData) {
  const { supabase } = await requireArea("events");
  await supabase.from("event_registrations").update({ status: String(form.get("status")) }).eq("id", String(form.get("id")));
  revalidatePath(`/admin/events/${String(form.get("event_id"))}/registrations`);
}

// ---------------------------------------------------------------- site content
import { DEFAULTS, type SettingKey } from "@/lib/defaults";

export async function saveSetting(key: SettingKey, _: ActionState, form: FormData): Promise<ActionState> {
  const { supabase, user } = await requireArea("content");
  let value: unknown;
  if (key === "services") {
    const days = form.getAll("day"), names = form.getAll("name"), times = form.getAll("time"), online = form.getAll("online_idx").map(String);
    value = days.map((d, i) => ({ day: String(d), name: String(names[i] ?? ""), time: String(times[i] ?? ""), online: online.includes(String(i)) })).filter((s) => s.day && s.name);
  } else {
    const base = DEFAULTS[key] as Record<string, unknown>;
    const v: Record<string, unknown> = {};
    for (const k of Object.keys(base)) {
      const raw = form.get(k);
      v[k] = Array.isArray(base[k]) ? String(raw ?? "").split("\n").map((s) => s.trim()).filter(Boolean) : raw === null || raw === "" ? (base[k] === null ? null : "") : String(raw);
    }
    value = v;
  }
  const { error } = await supabase.from("site_settings").upsert({ key, value, updated_by: user.id, updated_at: new Date().toISOString() });
  if (error) return { ok: false, message: error.message };
  revalidatePath("/", "layout");
  return { ok: true, message: "Saved. The website has been updated." };
}

// ---------------------------------------------------------------- roles
import { ROLES, type Role } from "@/lib/roles";

export async function setRoles(form: FormData) {
  const { supabase, roles, user } = await requireUser("/admin");
  if (!roles.includes("super_admin")) return;
  const target = String(form.get("user_id"));
  const wanted = ROLES.filter((r) => form.get(`role_${r}`) === "on") as Role[];
  if (target === user.id && !wanted.includes("super_admin")) wanted.push("super_admin"); // can't lock yourself out
  const del = supabase.from("user_roles").delete().eq("user_id", target);
  await (wanted.length ? del.not("role", "in", `(${wanted.join(",")})`) : del);
  if (wanted.length) await supabase.from("user_roles").upsert(wanted.map((role) => ({ user_id: target, role, granted_by: user.id })), { onConflict: "user_id,role", ignoreDuplicates: true });
  revalidatePath("/admin/members");
}

export async function unbanUser(form: FormData) {
  const { supabase } = await requireArea("moderation");
  await supabase.from("chat_bans").delete().eq("user_id", String(form.get("user_id")));
  revalidatePath("/admin/members");
}
