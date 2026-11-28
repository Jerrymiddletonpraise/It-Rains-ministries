import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useSeo } from "@/lib/seo";
import { useCollection } from "@/lib/data";
import { demoSermons } from "@/lib/demo";
import type { MediaKind, Sermon } from "@/lib/types";
import { PageHero } from "@/components/ui/PageHero";
import { DemoBadge, EmptyState, Section, Spinner } from "@/components/ui/Misc";
import { Input, Select } from "@/components/ui/Form";
import { SermonCard, sermonKindLabel } from "@/components/Cards";

const KINDS: MediaKind[] = ["video_sermon", "audio_sermon", "bible_teaching", "worship", "conference"];

export function MediaBrowser({ kinds, demo }: { kinds: MediaKind[]; demo: Sermon[] }) {
  const all = useCollection<Sermon>("sermons", demo, { eq: { status: "published" }, order: "preached_on" });
  const [q, setQ] = useState(""); const [kind, setKind] = useState(""); const [cat, setCat] = useState("");
  const pool = all.data.filter((s) => kinds.includes(s.kind));
  const categories = useMemo(() => [...new Set(pool.map((s) => s.category).filter(Boolean))] as string[], [pool]);
  const items = pool.filter((s) => (!kind || s.kind === kind) && (!cat || s.category === cat) &&
    (!q || [s.title, s.speaker, s.scripture_reference, s.series, s.description].join(" ").toLowerCase().includes(q.toLowerCase())));

  return (
    <>
      <div className="mb-10 grid gap-3 rounded-2xl border border-line bg-charcoal/50 p-4 sm:grid-cols-[1fr_auto_auto]">
        <label className="relative"><span className="sr-only">Search</span><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ivory-muted" aria-hidden /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title, speaker or scripture" className="pl-11" /></label>
        {kinds.length > 1 && <Select aria-label="Type" value={kind} onChange={(e) => setKind(e.target.value)}><option value="">All types</option>{kinds.map((k) => <option key={k} value={k}>{sermonKindLabel(k)}</option>)}</Select>}
        <Select aria-label="Category" value={cat} onChange={(e) => setCat(e.target.value)}><option value="">All categories</option>{categories.map((c) => <option key={c}>{c}</option>)}</Select>
      </div>
      {all.isDemo && <div className="mb-6"><DemoBadge /></div>}
      {all.loading ? <Spinner /> : items.length ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{items.map((s) => <SermonCard key={s.id} s={s} />)}</div> : <EmptyState title="No matching messages">Try a different search or category.</EmptyState>}
    </>
  );
}

export default function Sermons() {
  useSeo("Sermon Library", "Watch and listen to sermons, Bible teachings, worship and conference recordings from Global Christian Church.");
  return (
    <>
      <PageHero eyebrow="Media" title="Sermon Library" intro="Every message, free to watch and listen to, as often as you like. Video and audio sermons, Bible teachings, worship and conference recordings." />
      <Section><MediaBrowser kinds={KINDS} demo={demoSermons} /></Section>
    </>
  );
}
