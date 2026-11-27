import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, BookOpen, CalendarDays, Headphones, MapPin, Mic2, PlayCircle, Quote, UserRound, Users, Video } from "lucide-react";
import type { ChurchEvent, Ministry, Sermon, Testimony } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const kindMeta: Record<Sermon["kind"], { label: string; Icon: typeof Video }> = {
  video_sermon: { label: "Video sermon", Icon: Video }, audio_sermon: { label: "Audio sermon", Icon: Headphones },
  podcast: { label: "Podcast", Icon: Mic2 }, bible_teaching: { label: "Bible teaching", Icon: BookOpen },
  worship: { label: "Worship", Icon: PlayCircle }, conference: { label: "Conference", Icon: Users },
};
export const sermonKindLabel = (k: Sermon["kind"]) => kindMeta[k].label;

/** Cinematic artwork used when no thumbnail has been uploaded yet. */
export function Artwork({ seed, title, className = "" }: { seed: string; title?: string; className?: string }) {
  const h = [...seed].reduce((a, c) => a + c.charCodeAt(0), 0);
  const angle = h % 360;
  return (
    <div aria-hidden className={`grain relative overflow-hidden bg-ink ${className}`}>
      <div className="absolute inset-0" style={{ background: `radial-gradient(circle at ${20 + (h % 60)}% ${30 + (h % 40)}%, hsl(39 47% 66% / .45), transparent 55%), conic-gradient(from ${angle}deg at 50% 120%, hsl(240 4% 8%), hsl(36 38% 30% / .6), hsl(240 4% 6%))` }} />
      {title && <p className="absolute inset-x-5 bottom-4 line-clamp-2 font-display text-xl italic text-ivory/85">{title}</p>}
    </div>
  );
}

export function SermonCard({ s }: { s: Sermon }) {
  const { label, Icon } = kindMeta[s.kind];
  return (
    <article className="card-luxe group flex h-full flex-col">
      <Link to={`/sermons/${s.slug}`} className="flex h-full flex-col focus:outline-none">
        <div className="relative aspect-video">
          {s.thumbnail_url ? <img src={s.thumbnail_url} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /> : <Artwork seed={s.id} className="h-full w-full" />}
          <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-ink/80 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-gold-light backdrop-blur"><Icon className="h-3 w-3" aria-hidden />{label}</span>
          <PlayCircle className="absolute bottom-4 right-4 h-10 w-10 text-ivory/80 transition group-hover:scale-110 group-hover:text-gold" aria-hidden />
        </div>
        <div className="flex flex-1 flex-col p-6">
          {s.series && <p className="eyebrow mb-2 text-[0.6rem]">{s.series}</p>}
          <h3 className="text-2xl leading-tight group-hover:text-gold-light">{s.title}</h3>
          <p className="mt-3 text-sm text-ivory-muted">{[s.speaker, s.scripture_reference].filter(Boolean).join(" · ")}</p>
          <p className="mt-auto pt-4 text-xs text-ivory-muted/70">{s.preached_on && formatDate(s.preached_on)}{s.duration_minutes ? ` · ${s.duration_minutes} min` : ""}</p>
        </div>
      </Link>
    </article>
  );
}

export function EventCard({ e }: { e: ChurchEvent }) {
  const d = new Date(e.starts_at);
  return (
    <article className="card-luxe group flex gap-5 p-6">
      <div className="flex h-20 w-16 shrink-0 flex-col items-center justify-center rounded-xl border border-gold/30 bg-gold/5">
        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gold">{d.toLocaleString(undefined, { month: "short" })}</span>
        <span className="font-display text-3xl text-ivory">{d.getDate()}</span>
      </div>
      <div className="min-w-0">
        <h3 className="text-2xl leading-tight"><Link to={`/events#${e.slug}`} className="hover:text-gold-light">{e.title}</Link></h3>
        <p className="mt-2 flex items-center gap-2 text-sm text-ivory-muted"><CalendarDays className="h-4 w-4 text-gold" aria-hidden />{d.toLocaleString(undefined, { weekday: "long", hour: "numeric", minute: "2-digit" })}{e.is_recurring && " · Weekly"}</p>
        {e.location && <p className="mt-1 flex items-center gap-2 text-sm text-ivory-muted"><MapPin className="h-4 w-4 text-gold" aria-hidden />{e.location}</p>}
      </div>
    </article>
  );
}

export function MinistryCard({ m }: { m: Ministry }) {
  return (
    <Link to={`/ministries/${m.slug}`} className="card-luxe group block h-full p-7">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-2xl leading-tight">{m.name}</h3>
        <ArrowUpRight className="h-5 w-5 shrink-0 text-gold transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
      </div>
      {m.audience && <p className="eyebrow mt-3 text-[0.6rem]">{m.audience}</p>}
      {m.summary && <p className="mt-4 text-sm leading-relaxed text-ivory-muted">{m.summary}</p>}
    </Link>
  );
}

export function TestimonyCard({ t }: { t: Testimony }) {
  return (
    <figure className="card-luxe flex h-full flex-col p-8">
      <Quote className="h-8 w-8 text-gold/70" aria-hidden />
      {t.title && <p className="mt-4 font-display text-2xl text-ivory">{t.title}</p>}
      <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-ivory-muted">{t.body}</blockquote>
      <figcaption className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-gold-light">{t.author_name}{t.location && <span className="text-ivory-muted"> · {t.location}</span>}</figcaption>
    </figure>
  );
}

export function PersonPhoto({ src, name, className = "" }: { src: string | null; name: string; className?: string }) {
  if (src) return <img src={src} alt={name} loading="lazy" className={`object-cover ${className}`} />;
  return <div role="img" aria-label="Photo awaiting upload" className={`flex items-center justify-center bg-gradient-to-b from-charcoal-light to-ink ${className}`}><UserRound className="h-1/3 w-1/3 text-gold/40" aria-hidden /></div>;
}

export function useCountdown(target: string | null) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  if (!target) return null;
  const ms = Math.max(0, new Date(target).getTime() - now);
  return { done: ms === 0, days: Math.floor(ms / 864e5), hours: Math.floor(ms / 36e5) % 24, minutes: Math.floor(ms / 6e4) % 60, seconds: Math.floor(ms / 1e3) % 60 };
}

export function Countdown({ target, className = "" }: { target: string | null; className?: string }) {
  const c = useCountdown(target);
  if (!c) return null;
  const parts: [number, string][] = [[c.days, "Days"], [c.hours, "Hours"], [c.minutes, "Minutes"], [c.seconds, "Seconds"]];
  return (
    <div className={`flex gap-3 sm:gap-4 ${className}`} role="timer" aria-live="off" aria-label="Time until the next service">
      {parts.map(([v, l]) => (
        <div key={l} className="glass flex w-[4.5rem] flex-col items-center rounded-xl py-3 sm:w-20">
          <span className="font-display text-3xl text-ivory [font-variant-numeric:lining-nums_tabular-nums] sm:text-4xl">{String(v).padStart(2, "0")}</span>
          <span className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-gold">{l}</span>
        </div>
      ))}
    </div>
  );
}
