import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Mail, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { demoEvents, demoMinistries } from "@/lib/demo";
import type { ChurchEvent, Leader, Ministry } from "@/lib/types";
import { useSeo } from "@/lib/seo";
import { useAuth } from "@/auth/AuthProvider";
import { PageHero } from "@/components/ui/PageHero";
import { AwaitingBadge, DemoBadge, Notice, Section, Spinner } from "@/components/ui/Misc";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EventCard, PersonPhoto } from "@/components/Cards";
import NotFound from "./NotFound";

export default function MinistryDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [m, setM] = useState<Ministry | null | undefined>(undefined);
  const [isDemo, setIsDemo] = useState(false);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [joined, setJoined] = useState<"idle" | "busy" | "done" | "error">("idle");

  useEffect(() => {
    const demo = demoMinistries.find((d) => d.slug === slug) ?? null;
    if (!supabase) { setM(demo); setIsDemo(Boolean(demo)); setEvents(demoEvents.filter((e) => e.ministry_id === demo?.id)); return; }
    (async () => {
      const { data } = await supabase.from("ministries").select("*").eq("slug", slug!).eq("is_active", true).maybeSingle();
      if (!data) { setM(demo); setIsDemo(Boolean(demo)); return; }
      setM(data as Ministry);
      const [l, e] = await Promise.all([
        supabase.from("ministry_leaders").select("id,name,title,bio,photo_url,sort_order").eq("ministry_id", data.id).order("sort_order"),
        supabase.from("events").select("*").eq("ministry_id", data.id).eq("status", "published").gte("starts_at", new Date().toISOString()).order("starts_at").limit(4),
      ]);
      setLeaders((l.data ?? []) as Leader[]); setEvents((e.data ?? []) as ChurchEvent[]);
    })();
  }, [slug]);

  useSeo(m?.name ?? "Ministry", m?.summary ?? undefined);
  if (m === undefined) return <div className="pt-32"><Spinner /></div>;
  if (!m) return <NotFound />;

  async function join() {
    if (!supabase || !user || !m) return;
    setJoined("busy");
    const { error } = await supabase.from("ministry_members").insert({ ministry_id: m.id, user_id: user.id });
    setJoined(error && !error.message.includes("duplicate") ? "error" : "done");
  }

  return (
    <>
      <PageHero eyebrow={m.audience ?? "Ministry"} title={m.name} intro={m.summary ?? undefined} image={m.image_url} />
      <Section>
        <Link to="/ministries" className="mb-10 inline-flex items-center gap-2 text-sm text-ivory-muted hover:text-gold"><ArrowLeft className="h-4 w-4" aria-hidden />All ministries</Link>
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {isDemo && <DemoBadge className="mb-4" />}
            <h2 className="text-4xl">About this ministry</h2>
            <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-ivory-muted">{m.description ?? m.summary ?? "The ministry leader will add a description here soon."}</p>
            {m.meeting_info && <p className="mt-6 rounded-xl border border-line p-5 text-ivory-muted"><span className="font-semibold text-ivory">When we meet: </span>{m.meeting_info}</p>}

            <h2 className="mt-14 text-3xl">Upcoming events</h2>
            <div className="mt-6 grid gap-4">{events.length ? events.map((e) => <EventCard key={e.id} e={e} />) : <p className="text-ivory-muted">No upcoming events have been published for this ministry yet.</p>}</div>
          </div>
          <aside className="space-y-6">
            <div className="card-luxe p-6 lg:hover:translate-y-0">
              <p className="eyebrow mb-4">Get involved</p>
              {isDemo || !supabase ? <AwaitingBadge /> : !user ? (
                <><p className="mb-4 text-sm text-ivory-muted">Sign in to join this ministry.</p><ButtonLink to="/login" className="w-full">Sign in to join</ButtonLink></>
              ) : joined === "done" ? <Notice tone="success">You have registered your interest. A leader will be in touch.</Notice> : (
                <Button onClick={join} disabled={joined === "busy"} className="w-full"><UserPlus className="h-4 w-4" aria-hidden />Join this ministry</Button>
              )}
              {joined === "error" && <Notice tone="error" className="mt-3">Could not register right now. Please try again.</Notice>}
              <ButtonLink to="/volunteer" variant="outline" className="mt-3 w-full">Volunteer</ButtonLink>
              {m.contact_email && <a href={`mailto:${m.contact_email}`} className="mt-4 flex items-center gap-2 text-sm text-gold"><Mail className="h-4 w-4" aria-hidden />{m.contact_email}</a>}
            </div>
            <div className="card-luxe p-6 lg:hover:translate-y-0">
              <p className="eyebrow mb-4">Leadership</p>
              {leaders.length ? <ul className="space-y-4">{leaders.map((l) => <li key={l.id} className="flex items-center gap-4"><PersonPhoto src={l.photo_url} name={l.name} className="h-14 w-14 rounded-full" /><div><p className="font-semibold">{l.name}</p><p className="text-xs text-ivory-muted">{l.title}</p></div></li>)}</ul>
                : <p className="text-sm text-ivory-muted">Ministry leaders will be listed here once added in the Control Center.</p>}
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
