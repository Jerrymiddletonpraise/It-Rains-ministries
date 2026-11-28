import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LiveChat } from "@/components/LiveChat";
import { BookOpen, CalendarDays, Check, Facebook, HandHeart, MessagesSquare, Radio, Share2 } from "lucide-react";
import { useSeo } from "@/lib/seo";
import { useCollection, useSettings } from "@/lib/data";
import { demoBroadcast, demoSermons } from "@/lib/demo";
import type { Broadcast, Sermon } from "@/lib/types";
import { channelLiveEmbed, formatDateTime, toEmbedUrl } from "@/lib/utils";
import { Button, ButtonLink } from "@/components/ui/Button";
import { DemoBadge, Section, SectionHeading } from "@/components/ui/Misc";
import { Countdown, SermonCard } from "@/components/Cards";
import { SocialLinks } from "@/components/layout/Footer";
import { LogoMark } from "@/components/layout/Logo";
import { FreePromise } from "@/components/Founder";

const since = () => new Date(Date.now() - 6 * 3600_000).toISOString();

export default function WatchLive() {
  useSeo("GCC Worldwide Live", "Watch Global Christian Church live, completely free, from anywhere in the world. No membership, subscription, paywall or credit card.");
  const { settings: s } = useSettings();
  // Re-read the schedule the moment the media team presses Go live or End (Supabase Realtime, free plan).
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    if (!supabase) return;
    const sb = supabase;
    const ch = sb.channel("watch-broadcasts").on("postgres_changes", { event: "*", schema: "public", table: "broadcast_schedules" }, () => setRefresh((n) => n + 1)).subscribe();
    const poll = setInterval(() => setRefresh((n) => n + 1), 60_000);
    return () => { clearInterval(poll); void sb.removeChannel(ch); };
  }, []);
  const schedule = useCollection<Broadcast>("broadcast_schedules", [demoBroadcast], { refresh, gte: { scheduled_start: since() }, order: "scheduled_start", ascending: true, limit: 6 });
  const recordings = useCollection<Sermon>("sermons", demoSermons.slice(0, 3), { eq: { status: "published" }, order: "preached_on", limit: 3 });
  const live = schedule.isDemo ? null : schedule.data.find((b) => b.status === "live") ?? null;
  const upcoming = schedule.data.filter((b) => b.status === "scheduled");
  const current = live ?? upcoming[0] ?? null;
  const channelEmbed = s.streaming.auto_play_channel || live ? channelLiveEmbed(s.streaming.youtube_channel_id) : null;
  const embed = toEmbedUrl(live?.embed_url) ?? channelEmbed;
  const chatBroadcast = !schedule.isDemo && current && current.chat_enabled !== false ? current : null;
  const [copied, setCopied] = useState(false);

  async function share() {
    const data = { title: current?.title ?? "GCC Worldwide Live", text: "Join Global Christian Church live", url: window.location.href };
    try {
      if (navigator.share) { await navigator.share(data); return; }
      await navigator.clipboard.writeText(data.url); setCopied(true); setTimeout(() => setCopied(false), 2500);
    } catch { /* user cancelled share sheet */ }
  }

  return (
    <>
      <section className="border-b border-line bg-ink pb-16 pt-28">
        <div className="container">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <LogoMark className="h-9 w-9" />
              <h1 className="font-display text-3xl tracking-[0.12em] sm:text-4xl">GCC <span className="gold-text">WORLDWIDE</span> LIVE</h1>
              <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-gold-light">Free</span>
            </div>
            {live ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-live px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-white"><span className="h-2 w-2 animate-live rounded-full bg-white" />Live now</span>
            ) : <span className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-ivory-muted"><Radio className="h-3.5 w-3.5" aria-hidden />{embed ? "Plays automatically when we go live" : "Offline"}</span>}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="relative aspect-video overflow-hidden rounded-2xl border border-line bg-black shadow-luxe">
                {embed ? (
                  <iframe src={embed} title={live?.title ?? "Live broadcast"} className="absolute inset-0 h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
                ) : (
                  <div className="grain absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,hsl(var(--gold)/0.18),transparent_65%)] p-6 text-center">
                    <LogoMark className="h-16 w-16 opacity-80" />
                    <p className="mt-6 font-display text-2xl sm:text-3xl">{current ? "The next broadcast begins in" : "No broadcast is scheduled"}</p>
                    {current && <Countdown target={current.scheduled_start} className="mt-6" />}
                    <p className="mt-6 max-w-md text-xs text-ivory-muted">When we go live, the broadcast plays right here, free. No account, no payment and nothing to install.</p>
                  </div>
                )}
              </div>
              <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <h2 className="text-3xl">{current?.title ?? "GCC Worldwide Live"}</h2>
                  {current && <p className="mt-1 text-sm text-ivory-muted">{formatDateTime(current.scheduled_start)}</p>}
                  {current?.description && <p className="mt-3 max-w-2xl text-ivory-muted">{current.description}</p>}
                  {schedule.isDemo && <DemoBadge className="mt-3" label="Demo schedule" />}
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variant="outline" size="sm" onClick={share}>{copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}{copied ? "Link copied" : "Share"}</Button>
                  <ButtonLink to="/prayer" size="sm"><HandHeart className="h-4 w-4" aria-hidden />Prayer</ButtonLink>
                </div>
              </div>
            </div>

            <aside className="flex flex-col gap-6">
              <div className="card-luxe p-6 lg:hover:translate-y-0">
                <p className="eyebrow mb-3 flex items-center gap-2"><BookOpen className="h-3.5 w-3.5" aria-hidden />Today’s scripture</p>
                {current?.scripture_text ? (<><blockquote className="font-display text-xl italic leading-relaxed">“{current.scripture_text}”</blockquote><p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-gold-light">{current.scripture_reference}</p></>) : <p className="text-sm text-ivory-muted">The media team can attach scripture to each broadcast.</p>}
              </div>
              {chatBroadcast ? <LiveChat broadcastId={chatBroadcast.id} /> : (
                <div className="card-luxe flex-1 p-6 lg:hover:translate-y-0">
                  <p className="eyebrow mb-3 flex items-center gap-2"><MessagesSquare className="h-3.5 w-3.5" aria-hidden />Live chat</p>
                  <p className="text-sm text-ivory-muted">Live chat opens here for each scheduled service. Signed-in members can chat; anyone can read along.</p>
                </div>
              )}
              <div className="card-luxe p-6 lg:hover:translate-y-0">
                <p className="eyebrow mb-3">Also watch on</p>
                {s.streaming.facebook_page_url && <a href={s.streaming.facebook_page_url} target="_blank" rel="noopener noreferrer" className="mb-4 inline-flex items-center gap-2 text-sm text-gold-light hover:underline"><Facebook className="h-4 w-4" aria-hidden />Watch on Facebook</a>}
                <SocialLinks />
              </div>
            </aside>
          </div>
        </div>
      </section>

      <Section>
        <FreePromise className="mx-auto mb-16 max-w-3xl">God’s love is free, and access to worship should never be restricted by anyone’s ability to pay. Watch live services, recorded sermons, worship sessions and teachings from any country, on any phone, tablet, laptop or computer, with no membership, subscription, paywall or credit card.</FreePromise>
        <SectionHeading eyebrow="Schedule" title="Upcoming broadcasts" />
        <ul className="mx-auto grid max-w-3xl gap-3">
          {upcoming.length ? upcoming.map((b) => (
            <li key={b.id} className="flex items-center gap-4 rounded-xl border border-line p-5"><CalendarDays className="h-5 w-5 text-gold" aria-hidden /><div><p className="font-semibold">{b.title}</p><p className="text-sm text-ivory-muted">{formatDateTime(b.scheduled_start)}</p></div></li>
          )) : <li className="text-center text-ivory-muted">No upcoming broadcasts are scheduled yet.</li>}
          {s.service_times.map((t) => <li key={t.label} className="flex items-center gap-4 rounded-xl border border-line p-5"><CalendarDays className="h-5 w-5 text-gold" aria-hidden /><p><span className="font-semibold">{t.label}</span> <span className="text-ivory-muted">· {t.day} {t.time}</span></p></li>)}
        </ul>
      </Section>

      <Section tone="charcoal">
        <SectionHeading eyebrow="On demand" title="Previous services" />
        {recordings.isDemo && <div className="mb-6 text-center"><DemoBadge /></div>}
        <div className="grid gap-6 md:grid-cols-3">{recordings.data.map((r) => <SermonCard key={r.id} s={r} />)}</div>
        <div className="mt-10 text-center"><ButtonLink to="/sermons" variant="outline">Full sermon library</ButtonLink></div>
      </Section>
    </>
  );
}
