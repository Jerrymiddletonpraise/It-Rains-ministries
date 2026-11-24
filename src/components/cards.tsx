import Link from "next/link";
import { Calendar, MapPin, Play, Headphones, FileText, Globe } from "lucide-react";
import type { EventRow, MediaRow } from "@/lib/data";
import type { Department } from "@/lib/defaults";
import { formatDate, MEDIA_CATEGORIES } from "@/lib/utils";

export function SermonCard({ m }: { m: MediaRow }) {
  const Icon = m.media_type === "audio" ? Headphones : m.media_type === "document" ? FileText : Play;
  return (
    <Link href={`/sermons/${m.slug}`} className="group block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-navy-900/5 transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-video bg-heaven">
        {m.thumbnail_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={m.thumbnail_url} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 to-transparent" />
        <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gold-500/95 text-navy-950 transition group-hover:scale-110">
          <Icon className="h-6 w-6" />
        </span>
        <span className="absolute bottom-3 left-3 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">{MEDIA_CATEGORIES[m.category] ?? m.category}</span>
        {m.members_only && <span className="absolute right-3 top-3 rounded-full bg-royal-700 px-2.5 py-1 text-xs font-semibold text-white">Members</span>}
      </div>
      <div className="p-5">
        <h3 className="font-serif text-xl font-bold text-navy-900 group-hover:text-royal-700">{m.title}</h3>
        <p className="mt-1 text-sm text-navy-800/70">{[m.speaker, m.preached_on && formatDate(m.preached_on), m.scripture].filter(Boolean).join(" · ")}</p>
      </div>
    </Link>
  );
}

export function EventCard({ e }: { e: EventRow }) {
  const d = new Date(e.starts_at);
  return (
    <Link href={`/events/${e.slug}`} className="group flex gap-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-navy-900/5 transition hover:shadow-xl">
      <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-xl bg-royal-800 text-white">
        <span className="text-xs font-bold uppercase tracking-widest text-gold-400">{formatDate(d, { month: "short" }, e.timezone)}</span>
        <span className="font-serif text-3xl font-bold">{formatDate(d, { day: "numeric" }, e.timezone)}</span>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-widest text-gold-600">{e.category}</p>
        <h3 className="font-serif text-xl font-bold text-navy-900 group-hover:text-royal-700">{e.title}</h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-navy-800/70"><Calendar className="h-4 w-4" />{formatDate(d, { weekday: "short", hour: "numeric", minute: "2-digit", timeZoneName: "short" }, e.timezone)}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-sm text-navy-800/70">
          {e.is_online ? <><Globe className="h-4 w-4" />Online</> : <><MapPin className="h-4 w-4" />{e.location ?? "Location TBA"}</>}
        </p>
      </div>
    </Link>
  );
}

export function DepartmentCard({ d }: { d: Department }) {
  return (
    <Link href={`/ministries/${d.slug}`} className="group relative block overflow-hidden rounded-2xl bg-navy-900 p-7 text-white transition hover:-translate-y-1 hover:shadow-2xl">
      {d.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={d.image_url} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-30 transition group-hover:opacity-40" />
      )}
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-royal-700/40 blur-2xl" />
      <div className="relative">
        <h3 className="font-serif text-2xl font-bold">{d.name}</h3>
        <p className="mt-2 text-sm text-white/75">{d.summary}</p>
        <p className="mt-5 text-sm font-semibold text-gold-400">Learn more →</p>
      </div>
    </Link>
  );
}
