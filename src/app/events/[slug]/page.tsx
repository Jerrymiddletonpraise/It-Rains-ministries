import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Calendar, MapPin, Globe, Users, CalendarPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { enabled, env } from "@/lib/env";
import type { EventRow } from "@/lib/data";
import { Card, Notice, PageHero, Section } from "@/components/ui";
import { EventRegistrationForm } from "@/components/forms/EventRegistrationForm";
import { formatDateTime } from "@/lib/utils";
import { getSession } from "@/lib/auth";

export const revalidate = 30;

async function load(slug: string) {
  if (!enabled.supabase) return null;
  const s = await createClient();
  const { data } = await s.from("events").select("*").eq("slug", slug).eq("published", true).maybeSingle();
  if (!data) return null;
  const { data: taken } = await s.rpc("event_seats_taken", { e: data.id });
  return { event: data as EventRow, taken: (taken as number) ?? 0 };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const r = await load((await params).slug);
  return r ? { title: r.event.title, description: r.event.summary, openGraph: { images: r.event.image_url ? [r.event.image_url] : [] } } : {};
}

function gcal(e: EventRow) {
  const f = (d: string) => new Date(d).toISOString().replace(/[-:]|\.\d{3}/g, "");
  const end = e.ends_at ?? new Date(new Date(e.starts_at).getTime() + 2 * 3600_000).toISOString();
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(e.title)}&dates=${f(e.starts_at)}/${f(end)}&details=${encodeURIComponent(e.summary + "\n" + env.siteUrl + "/events/" + e.slug)}&location=${encodeURIComponent(e.is_online ? "Online" : e.location ?? "")}`;
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const r = await load((await params).slug);
  if (!r) notFound();
  const { event: e, taken } = r;
  const { user } = await getSession();
  const left = e.capacity ? Math.max(0, e.capacity - taken) : null;
  const past = new Date(e.ends_at ?? e.starts_at).getTime() < Date.now();
  const mapQ = encodeURIComponent(e.map_query || e.location || "");
  return (
    <>
      <PageHero eyebrow={e.category} title={e.title} intro={e.summary} />
      <Section>
        <div className="grid gap-10 lg:grid-cols-[3fr_2fr]">
          <div>
            {e.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={e.image_url} alt="" className="mb-8 aspect-video w-full rounded-3xl object-cover" />
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="flex gap-3"><Calendar className="shrink-0 text-gold-600" /><div><p className="font-semibold">{formatDateTime(e.starts_at, e.timezone)}</p>{e.ends_at && <p className="text-sm text-navy-800/60">until {formatDateTime(e.ends_at, e.timezone)}</p>}</div></Card>
              <Card className="flex gap-3">{e.is_online ? <Globe className="shrink-0 text-gold-600" /> : <MapPin className="shrink-0 text-gold-600" />}<p className="font-semibold">{e.is_online ? "Online event" : e.location ?? "Location to be announced"}</p></Card>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={`/api/events/${e.id}/ics`} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-sm"><CalendarPlus className="h-4 w-4" />Apple / Outlook calendar</a>
              <a href={gcal(e)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-sm"><CalendarPlus className="h-4 w-4" />Google Calendar</a>
            </div>
            <h2 className="mt-10 font-serif text-3xl font-bold text-royal-800">About this event</h2>
            <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-navy-800/85">{e.description}</p>
            {!e.is_online && mapQ && (
              <iframe title="Event location" className="mt-8 h-72 w-full rounded-2xl border-0" loading="lazy"
                src={env.mapsKey ? `https://www.google.com/maps/embed/v1/place?key=${env.mapsKey}&q=${mapQ}` : `https://maps.google.com/maps?q=${mapQ}&output=embed`} />
            )}
          </div>
          <Card className="h-max p-6 md:p-8 lg:sticky lg:top-28">
            <h2 className="font-serif text-2xl font-bold">Register</h2>
            {left !== null && <p className="mt-1 flex items-center gap-2 text-sm text-navy-800/70"><Users className="h-4 w-4" />{left > 0 ? `${left} of ${e.capacity} places left` : "This event is full"}</p>}
            <div className="mt-5">
              {past ? <Notice>This event has already taken place.</Notice>
                : !e.registration_open ? <Notice>Registration is closed for this event.</Notice>
                : left === 0 ? <Notice kind="warn">This event is full. Please contact us to join the waiting list.</Notice>
                : <EventRegistrationForm eventId={e.id} defaultEmail={user?.email ?? ""} defaultName={(user?.user_metadata?.full_name as string) ?? ""} />}
            </div>
          </Card>
        </div>
      </Section>
    </>
  );
}
