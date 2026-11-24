import { createClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

const fmt = (d: string) => new Date(d).toISOString().replace(/[-:]|\.\d{3}/g, "");
const esc = (s: string) => s.replace(/[\;,]/g, (m) => `\\${m}`).replace(/\n/g, "\\n");

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await createClient();
  const { data: e } = await s.from("events").select("*").eq("id", id).maybeSingle();
  if (!e) return new Response("Not found", { status: 404 });
  const end = e.ends_at ?? new Date(new Date(e.starts_at).getTime() + 2 * 3600_000).toISOString();
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//IT RAINS MINISTRIES//Events//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "BEGIN:VEVENT",
    `UID:${e.id}@itrainsministries`, `DTSTAMP:${fmt(new Date().toISOString())}`, `DTSTART:${fmt(e.starts_at)}`, `DTEND:${fmt(end)}`,
    `SUMMARY:${esc(e.title)}`, `DESCRIPTION:${esc(`${e.summary}\n${env.siteUrl}/events/${e.slug}`)}`,
    `LOCATION:${esc(e.is_online ? e.online_url ?? "Online" : e.location ?? "")}`, `URL:${env.siteUrl}/events/${e.slug}`,
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  return new Response(ics, { headers: { "Content-Type": "text/calendar; charset=utf-8", "Content-Disposition": `attachment; filename="${e.slug}.ics"` } });
}
