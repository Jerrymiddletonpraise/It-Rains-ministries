"use server";
import { revalidatePath } from "next/cache";
import { requireArea } from "@/lib/auth";
import { sendBatch, p } from "@/lib/email";
import { env } from "@/lib/env";
import { sendPushToAll } from "@/lib/push";
import type { ActionState } from "@/components/forms/ActionForm";

export async function sendNewsletter(_: ActionState, f: FormData): Promise<ActionState> {
  const { supabase, user } = await requireArea("newsletter");
  const subject = String(f.get("subject") ?? "").trim();
  const body = String(f.get("body") ?? "").trim();
  const audience = String(f.get("audience") ?? "subscribers");
  const test = f.get("test") === "1";
  if (subject.length < 3 || body.length < 10) return { ok: false, message: "Please write a subject and message." };

  const recipients = new Map<string, string | null>(); // email -> unsubscribe token
  if (test) recipients.set(user.email!, null);
  else {
    if (audience !== "members") {
      const { data } = await supabase.from("newsletter_subscribers").select("email,unsubscribe_token").eq("subscribed", true);
      data?.forEach((s) => recipients.set(s.email.toLowerCase(), s.unsubscribe_token));
    }
    if (audience !== "subscribers") {
      const { data } = await supabase.from("profiles").select("email").eq("newsletter_opt_in", true).not("email", "is", null);
      data?.forEach((m) => { if (!recipients.has(m.email!.toLowerCase())) recipients.set(m.email!.toLowerCase(), null); });
    }
  }
  if (!recipients.size) return { ok: false, message: "There are no recipients in this audience yet." };
  const items = [...recipients].map(([to, token]) => ({
    to, subject: test ? `[TEST] ${subject}` : subject, title: subject,
    html: p(body) + `<p style="font-size:12px;color:#888;margin-top:30px">${token ? `<a href="${env.siteUrl}/api/newsletter/unsubscribe?token=${token}">Unsubscribe</a>` : `Manage email preferences in <a href="${env.siteUrl}/account/profile">your account</a>`}.</p>`,
  }));
  const res = await sendBatch(items);
  if (!test && res.sent) {
    await supabase.from("newsletters").insert({ subject, body, audience, sent_count: res.sent, sent_at: new Date().toISOString(), created_by: user.id });
    revalidatePath("/admin/newsletter");
  }
  if (res.reason && !res.sent) return { ok: false, message: `Not sent: ${res.reason}.` };
  return { ok: true, message: test ? `Test sent to ${user.email}.` : `Sent to ${res.sent} recipient${res.sent === 1 ? "" : "s"}.${res.reason ? ` Stopped early: ${res.reason}` : ""}` };
}

export async function sendPushNotification(_: ActionState, f: FormData): Promise<ActionState> {
  await requireArea("newsletter");
  const title = String(f.get("title") ?? "").trim(), body = String(f.get("body") ?? "").trim(), url = String(f.get("url") ?? "/").trim() || "/";
  if (!title) return { ok: false, message: "Please add a title." };
  const r = await sendPushToAll({ title, body, url });
  return r.error ? { ok: false, message: r.error } : { ok: true, message: `Notification sent to ${r.sent} device${r.sent === 1 ? "" : "s"}.` };
}
