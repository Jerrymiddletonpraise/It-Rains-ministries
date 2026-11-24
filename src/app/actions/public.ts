"use server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { enabled, env } from "@/lib/env";
import { guardForm, looksLikeSpam } from "@/lib/security";
import { sendEmail, notifyMinistry, p, button } from "@/lib/email";
import { formatDateTime } from "@/lib/utils";
import type { ActionState } from "@/components/forms/ActionForm";

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const bool = (f: FormData, k: string) => f.get(k) === "on" || f.get(k) === "true";
const notReady: ActionState = { ok: false, message: "The ministry database is not connected yet. Please try again later." };

function fail(e: unknown): ActionState {
  if (e instanceof z.ZodError) return { ok: false, message: e.issues[0]?.message ?? "Please check the form." };
  console.error(e);
  return { ok: false, message: "Something went wrong. Please try again." };
}

const email = z.string().email("Please enter a valid email address.").max(200);

export async function subscribeNewsletter(_: ActionState, f: FormData): Promise<ActionState> {
  if (!enabled.serviceRole) return notReady;
  const blocked = await guardForm(f, "newsletter", 5, 3600);
  if (blocked) return { ok: false, message: blocked };
  try {
    const data = z.object({ email, name: z.string().max(120).optional() }).parse({ email: str(f, "email").toLowerCase(), name: str(f, "name") || undefined });
    const db = createAdminClient();
    const { data: row, error } = await db.from("newsletter_subscribers")
      .upsert({ email: data.email, name: data.name, subscribed: true }, { onConflict: "email" }).select("unsubscribe_token").single();
    if (error) throw error;
    await sendEmail({
      to: data.email, subject: "Welcome to the IT RAINS MINISTRIES family",
      html: p("Thank you for subscribing. You'll receive ministry news, upcoming services, events and words of encouragement.") +
        button(`${env.siteUrl}/watch`, "Watch a service") +
        `<p style="font-size:12px;color:#666">Don't want these emails? <a href="${env.siteUrl}/api/newsletter/unsubscribe?token=${row.unsubscribe_token}">Unsubscribe</a>.</p>`,
    });
    return { ok: true, message: "You're subscribed. God bless you!" };
  } catch (e) { return fail(e); }
}

export async function submitContact(_: ActionState, f: FormData): Promise<ActionState> {
  if (!enabled.serviceRole) return notReady;
  const blocked = await guardForm(f, "contact");
  if (blocked) return { ok: false, message: blocked };
  try {
    const data = z.object({
      kind: z.enum(["contact", "greeting"]),
      name: z.string().min(2, "Please enter your name.").max(120),
      email,
      phone: z.string().max(40).optional(),
      subject: z.string().max(200).optional(),
      message: z.string().min(5, "Please write a short message.").max(5000),
    }).parse({ kind: str(f, "kind") || "contact", name: str(f, "name"), email: str(f, "email"), phone: str(f, "phone") || undefined, subject: str(f, "subject") || undefined, message: str(f, "message") });
    if (looksLikeSpam(data.message)) return { ok: false, message: "Your message was flagged as spam. Please remove links and try again." };
    const { error } = await createAdminClient().from("contact_messages").insert(data);
    if (error) throw error;
    await notifyMinistry(`New ${data.kind === "greeting" ? "greeting" : "message"} from ${data.name}`,
      p(`From: ${data.name} <${data.email}> ${data.phone ?? ""}`) + p(data.subject ?? "") + p(data.message), data.email);
    await sendEmail({ to: data.email, subject: "We received your message", html: p(`Dear ${data.name},`) + p("Thank you for reaching out to IT RAINS MINISTRIES. A member of our team will respond as soon as possible.") + p("Grace and peace,\nIT RAINS MINISTRIES") });
    return { ok: true, message: "Thank you! Your message has been received." };
  } catch (e) { return fail(e); }
}

export async function submitPrayer(_: ActionState, f: FormData): Promise<ActionState> {
  if (!enabled.supabase) return notReady;
  const blocked = await guardForm(f, "prayer", 6, 3600);
  if (blocked) return { ok: false, message: blocked };
  try {
    const data = z.object({
      name: z.string().min(1, "Please enter your name (or 'Anonymous').").max(120),
      email: email.optional(),
      phone: z.string().max(40).optional(),
      country: z.string().max(80).optional(),
      request: z.string().min(5, "Please share your prayer request.").max(5000),
      kind: z.enum(["prayer", "urgent", "counseling", "followup"]),
      wants_followup: z.boolean(),
    }).parse({
      name: str(f, "name"), email: str(f, "email") || undefined, phone: str(f, "phone") || undefined, country: str(f, "country") || undefined,
      request: str(f, "request"), kind: str(f, "kind") || "prayer", wants_followup: bool(f, "wants_followup"),
    });
    if ((data.kind === "counseling" || data.wants_followup) && !data.email && !data.phone)
      return { ok: false, message: "Please give an email or phone number so we can follow up with you." };
    const supabase = await createClient();
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("prayer_requests").insert({ ...data, user_id: u.user?.id ?? null, is_private: true });
    if (error) throw error;
    const label = { prayer: "Prayer request", urgent: "URGENT prayer request", counseling: "Counseling request", followup: "Follow-up request" }[data.kind];
    await notifyMinistry(`${label} from ${data.name}`, p(`${label} received. Sign in to the admin dashboard to review it.`) + button(`${env.siteUrl}/admin/prayer`, "Open prayer dashboard"));
    if (data.email) await sendEmail({ to: data.email, subject: "We are praying with you", html: p(`Dear ${data.name},`) + p("Your request has been received and is being held in confidence by our prayer team. \"The effectual fervent prayer of a righteous man availeth much.\" (James 5:16)") + (data.wants_followup || data.kind === "counseling" ? p("A member of our pastoral team will contact you.") : "") + p("With love,\nIT RAINS MINISTRIES Prayer Team") });
    return { ok: true, message: "Your request has been received. Our prayer team is standing with you." };
  } catch (e) { return fail(e); }
}

export async function submitTestimony(_: ActionState, f: FormData): Promise<ActionState> {
  if (!enabled.supabase) return notReady;
  const blocked = await guardForm(f, "testimony", 4, 3600);
  if (blocked) return { ok: false, message: blocked };
  try {
    const data = z.object({
      name: z.string().min(2, "Please enter your name.").max(120),
      email: email.optional(),
      location: z.string().max(120).optional(),
      title: z.string().min(3, "Please add a title.").max(160),
      body: z.string().min(20, "Please share a little more of your testimony.").max(8000),
      is_answered_prayer: z.boolean(),
      consent_to_publish: z.boolean(),
      show_name: z.boolean(),
    }).parse({
      name: str(f, "name"), email: str(f, "email") || undefined, location: str(f, "location") || undefined, title: str(f, "title"), body: str(f, "body"),
      is_answered_prayer: bool(f, "is_answered_prayer"), consent_to_publish: bool(f, "consent_to_publish"), show_name: bool(f, "show_name"),
    });
    if (looksLikeSpam(data.body)) return { ok: false, message: "Your testimony was flagged as spam. Please remove links and try again." };
    const supabase = await createClient();
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("testimonies").insert({ ...data, user_id: u.user?.id ?? null, status: "pending" });
    if (error) throw error;
    await notifyMinistry(`New testimony: ${data.title}`, p(`${data.name} shared a testimony${data.consent_to_publish ? " and consented to publishing" : " (private, not for publishing)"}.`) + button(`${env.siteUrl}/admin/testimonies`, "Review testimonies"));
    return { ok: true, message: data.consent_to_publish ? "Glory to God! Your testimony will appear after a pastor reviews it." : "Glory to God! Thank you for sharing your testimony with us." };
  } catch (e) { return fail(e); }
}

export async function registerForEvent(_: ActionState, f: FormData): Promise<ActionState> {
  if (!enabled.supabase) return notReady;
  const blocked = await guardForm(f, "event", 6, 3600);
  if (blocked) return { ok: false, message: blocked };
  try {
    const data = z.object({
      event_id: z.string().uuid(),
      name: z.string().min(2, "Please enter your name.").max(120),
      email,
      phone: z.string().max(40).optional(),
      guests: z.coerce.number().int().min(0).max(20),
      notes: z.string().max(1000).optional(),
    }).parse({ event_id: str(f, "event_id"), name: str(f, "name"), email: str(f, "email").toLowerCase(), phone: str(f, "phone") || undefined, guests: str(f, "guests") || 0, notes: str(f, "notes") || undefined });
    const supabase = await createClient();
    const { data: u } = await supabase.auth.getUser();
    const { data: event } = await supabase.from("events").select("id,slug,title,starts_at,timezone,location,is_online,online_url").eq("id", data.event_id).single();
    if (!event) return { ok: false, message: "Event not found." };
    const { error } = await supabase.from("event_registrations").insert({ ...data, user_id: u.user?.id ?? null });
    if (error) {
      if (error.code === "23505") return { ok: false, message: "You're already registered for this event with that email." };
      if (/full|closed/i.test(error.message)) return { ok: false, message: error.message };
      throw error;
    }
    await sendEmail({
      to: data.email, subject: `You're registered: ${event.title}`,
      html: p(`Dear ${data.name},`) + p(`Your registration for ${event.title} is confirmed${data.guests ? ` for you and ${data.guests} guest(s)` : ""}.`) +
        p(`When: ${formatDateTime(event.starts_at, event.timezone)}`) + p(`Where: ${event.is_online ? "Online" + (event.online_url ? ` (${event.online_url})` : "") : event.location ?? "See event page"}`) +
        button(`${env.siteUrl}/api/events/${event.id}/ics`, "Add to my calendar") + p("We look forward to worshipping with you!"),
    });
    return { ok: true, message: "You're registered! A confirmation email is on its way." };
  } catch (e) { return fail(e); }
}
