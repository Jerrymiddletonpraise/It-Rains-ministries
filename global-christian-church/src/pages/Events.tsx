import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, List, MapPin, Video } from "lucide-react";
import { useSeo } from "@/lib/seo";
import { useCollection } from "@/lib/data";
import { demoEvents } from "@/lib/demo";
import type { ChurchEvent } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/AuthProvider";
import { cn, formatDateTime } from "@/lib/utils";
import { PageHero } from "@/components/ui/PageHero";
import { AwaitingBadge, DemoBadge, Notice, Section } from "@/components/ui/Misc";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Artwork } from "@/components/Cards";

/** Expands weekly recurring events into concrete dates inside [from, to). */
function occurrences(events: ChurchEvent[], from: Date, to: Date) {
  const out: { e: ChurchEvent; at: Date }[] = [];
  for (const e of events) {
    const start = new Date(e.starts_at);
    if (e.is_recurring && e.recurrence_rule?.includes("FREQ=WEEKLY")) {
      const d = new Date(start);
      while (d < from) d.setDate(d.getDate() + 7);
      for (; d < to; d.setDate(d.getDate() + 7)) out.push({ e, at: new Date(d) });
    } else if (start >= from && start < to) out.push({ e, at: start });
  }
  return out.sort((a, b) => a.at.getTime() - b.at.getTime());
}

function RegisterButton({ e, isDemo }: { e: ChurchEvent; isDemo: boolean }) {
  const { user } = useAuth();
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  if (!e.registration_required) return null;
  if (isDemo || !supabase) return <AwaitingBadge label="Registration awaiting configuration" />;
  if (!user) return <ButtonLink to="/login" size="sm">Sign in to register</ButtonLink>;
  if (state === "done") return <Notice tone="success">You are registered.</Notice>;
  return (
    <div>
      <Button size="sm" disabled={state === "busy"} onClick={async () => {
        setState("busy");
        const { error } = await supabase!.from("event_registrations").insert({ event_id: e.id, user_id: user.id });
        setState(!error || error.code === "23505" ? "done" : "error");
      }}>Register</Button>
      {state === "error" && <p className="mt-2 text-xs text-red-300">Registration failed. The event may be full.</p>}
    </div>
  );
}

export default function Events() {
  useSeo("Events and Calendar", "Upcoming services, gatherings and events at Global Christian Church.");
  const ev = useCollection<ChurchEvent>("events", demoEvents, { eq: { status: "published" }, order: "starts_at", ascending: true });
  const [view, setView] = useState<"list" | "calendar">("list");
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });

  const upcoming = useMemo(() => { const now = new Date(); const to = new Date(now.getTime() + 90 * 864e5); return occurrences(ev.data, new Date(now.getTime() - 3 * 36e5), to).slice(0, 30); }, [ev.data]);
  const monthOcc = useMemo(() => occurrences(ev.data, month, new Date(month.getFullYear(), month.getMonth() + 1, 1)), [ev.data, month]);
  const lead = month.getDay();
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const today = new Date();

  return (
    <>
      <PageHero eyebrow="Calendar" title="Events and Calendar" intro="Services, gatherings and special moments. Join us in person or online." />
      <Section>
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          {ev.isDemo ? <DemoBadge /> : <span />}
          <div className="flex rounded-full border border-line p-1" role="tablist" aria-label="View">
            {(["list", "calendar"] as const).map((v) => (
              <button key={v} role="tab" aria-selected={view === v} onClick={() => setView(v)} className={cn("flex items-center gap-2 rounded-full px-4 py-2 text-sm", view === v ? "bg-gold text-ink" : "text-ivory-muted")}>
                {v === "list" ? <List className="h-4 w-4" aria-hidden /> : <CalendarDays className="h-4 w-4" aria-hidden />}{v === "list" ? "List" : "Calendar"}
              </button>
            ))}
          </div>
        </div>

        {view === "list" ? (
          <ul className="grid gap-6">
            {upcoming.map(({ e, at }) => (
              <li key={`${e.id}-${at.toISOString()}`} id={e.slug} className="card-luxe grid gap-0 sm:grid-cols-[220px_1fr] lg:hover:translate-y-0">
                {e.image_url ? <img src={e.image_url} alt="" loading="lazy" className="h-full max-h-56 w-full object-cover" /> : <Artwork seed={e.id} className="h-40 sm:h-full" />}
                <div className="p-6">
                  <p className="eyebrow text-[0.6rem]">{formatDateTime(at.toISOString())}{e.is_recurring && " · Recurring"}</p>
                  <h2 className="mt-2 text-3xl">{e.title}</h2>
                  {e.description && <p className="mt-3 text-ivory-muted">{e.description}</p>}
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-ivory-muted">
                    {e.location && <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gold" aria-hidden />{e.location}</span>}
                    {e.online_url && <a href={e.online_url} className="flex items-center gap-2 text-gold hover:underline"><Video className="h-4 w-4" aria-hidden />Join online</a>}
                    {e.capacity && <span>Capacity {e.capacity}</span>}
                  </div>
                  <div className="mt-5"><RegisterButton e={e} isDemo={ev.isDemo} /></div>
                </div>
              </li>
            ))}
            {!upcoming.length && <li className="text-center text-ivory-muted">No upcoming events are published yet.</li>}
          </ul>
        ) : (
          <div className="rounded-2xl border border-line bg-charcoal/40 p-4 sm:p-6">
            <div className="mb-6 flex items-center justify-between">
              <button aria-label="Previous month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="rounded-full border border-line p-2 hover:border-gold"><ChevronLeft className="h-4 w-4" /></button>
              <h2 className="text-3xl">{month.toLocaleString(undefined, { month: "long", year: "numeric" })}</h2>
              <button aria-label="Next month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="rounded-full border border-line p-2 hover:border-gold"><ChevronRight className="h-4 w-4" /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-gold" aria-hidden>{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d} className="py-2">{d}</div>)}</div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: lead }).map((_, i) => <div key={`b${i}`} />)}
              {Array.from({ length: days }).map((_, i) => {
                const n = i + 1; const items = monthOcc.filter((o) => o.at.getDate() === n);
                const isToday = today.getFullYear() === month.getFullYear() && today.getMonth() === month.getMonth() && today.getDate() === n;
                return (
                  <div key={n} className={cn("min-h-[72px] rounded-lg border border-line/60 p-1.5 text-left sm:min-h-[100px]", isToday && "border-gold/70 bg-gold/5")}>
                    <span className={cn("text-xs", isToday ? "font-bold text-gold" : "text-ivory-muted")}>{n}</span>
                    <ul className="mt-1 space-y-1">{items.map((o) => <li key={o.e.id} className="truncate rounded bg-gold/15 px-1.5 py-0.5 text-[0.65rem] text-gold-light" title={o.e.title}><a href={`#${o.e.slug}`} onClick={() => setView("list")}>{o.e.title}</a></li>)}</ul>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Section>
    </>
  );
}
