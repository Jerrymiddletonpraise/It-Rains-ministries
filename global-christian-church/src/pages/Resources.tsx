import { useMemo, useState, type FormEvent } from "react";
import { BookOpen, Download, ExternalLink, Lock, Search } from "lucide-react";
import { useSeo } from "@/lib/seo";
import { useCollection } from "@/lib/data";
import { demoDevotionals, demoResources } from "@/lib/demo";
import type { Resource } from "@/lib/types";
import { useAuth } from "@/auth/AuthProvider";
import { PageHero } from "@/components/ui/PageHero";
import { DemoBadge, Notice, Section, SectionHeading, Spinner } from "@/components/ui/Misc";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Form";

/**
 * Online Bible reader. Uses bible-api.com, a free service with no API key that serves
 * public-domain translations only (World English Bible, King James Version), so no licence is needed.
 */
const TRANSLATIONS = [{ id: "web", label: "World English Bible (public domain)" }, { id: "kjv", label: "King James Version (public domain)" }];

function BibleReader() {
  const [ref, setRef] = useState("John 3:16-17");
  const [tr, setTr] = useState("web");
  const [state, setState] = useState<{ loading: boolean; error: string | null; ref?: string; verses?: { verse: number; text: string; chapter: number }[] }>({ loading: false, error: null });

  async function lookup(e?: FormEvent) {
    e?.preventDefault();
    setState({ loading: true, error: null });
    try {
      const r = await fetch(`https://bible-api.com/${encodeURIComponent(ref)}?translation=${tr}`);
      const j = await r.json();
      if (!r.ok || j.error) throw new Error(j.error ?? "Passage not found");
      setState({ loading: false, error: null, ref: j.reference, verses: j.verses });
    } catch (err) {
      setState({ loading: false, error: err instanceof Error && err.message !== "Failed to fetch" ? err.message : "The Bible service could not be reached. Please check your connection and try again." });
    }
  }

  return (
    <div className="card-luxe p-6 sm:p-10 lg:hover:translate-y-0">
      <form onSubmit={lookup} className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <label><span className="sr-only">Passage</span><Input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="e.g. Psalm 23 or Romans 8:28" /></label>
        <Select aria-label="Translation" value={tr} onChange={(e) => setTr(e.target.value)}>{TRANSLATIONS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}</Select>
        <Button type="submit" disabled={state.loading}><BookOpen className="h-4 w-4" aria-hidden />Read</Button>
      </form>
      <div className="mt-8 min-h-[120px]" aria-live="polite">
        {state.loading && <Spinner label="Loading passage" />}
        {state.error && <Notice tone="error">{state.error}</Notice>}
        {state.verses && (
          <article>
            <h3 className="text-3xl">{state.ref}</h3>
            <p className="mt-6 font-display text-xl leading-loose text-ivory/90">
              {state.verses.map((v) => <span key={`${v.chapter}-${v.verse}`}><sup className="mr-1 font-sans text-[0.6rem] text-gold">{v.verse}</sup>{v.text.trim()} </span>)}
            </p>
            <p className="mt-6 text-xs text-ivory-muted">{TRANSLATIONS.find((t) => t.id === tr)?.label}. Text provided by bible-api.com.</p>
          </article>
        )}
        {!state.loading && !state.error && !state.verses && <p className="text-center text-sm text-ivory-muted">Enter a book, chapter or verse to begin reading.</p>}
      </div>
    </div>
  );
}

export default function Resources() {
  useSeo("Online Bible and Resources", "Read the Bible online and explore study guides, reading plans and resources from Global Christian Church.");
  const { user } = useAuth();
  const res = useCollection<Resource>("resources", demoResources, { eq: { is_published: true }, order: "created_at" });
  const [q, setQ] = useState(""); const [cat, setCat] = useState("");
  const cats = useMemo(() => [...new Set(res.data.map((r) => r.category))], [res.data]);
  const items = res.data.filter((r) => (!cat || r.category === cat) && (!q || `${r.title} ${r.description}`.toLowerCase().includes(q.toLowerCase())));
  const today = demoDevotionals[0];

  return (
    <>
      <PageHero eyebrow="Grow" title="Online Bible and Resources" intro="Read, study and grow with Scripture and resources for every stage of faith." />
      <Section>
        <SectionHeading eyebrow="Online Bible" title="Read the Scriptures" />
        <div className="mx-auto max-w-4xl"><BibleReader /></div>
      </Section>
      <Section tone="charcoal">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <p className="eyebrow mb-4">Daily scripture</p>
          <blockquote className="font-display text-3xl italic leading-snug">“{today.scripture_text}”</blockquote>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-gold-light">{today.scripture_reference}</p>
          <ButtonLink to="/devotionals" variant="ghost" className="mt-6">Today’s devotional</ButtonLink>
        </div>
        <SectionHeading eyebrow="Resource center" title="Study guides, plans and courses" />
        <div className="mb-8 grid gap-3 sm:grid-cols-[1fr_auto]">
          <label className="relative"><span className="sr-only">Search resources</span><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ivory-muted" aria-hidden /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search resources" className="pl-11" /></label>
          <Select aria-label="Category" value={cat} onChange={(e) => setCat(e.target.value)}><option value="">All categories</option>{cats.map((c) => <option key={c}>{c}</option>)}</Select>
        </div>
        {res.isDemo && <DemoBadge className="mb-6" />}
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((r) => {
            const locked = r.is_members_only && !user;
            const href = r.file_url ?? r.external_url;
            return (
              <li key={r.id} className="card-luxe flex flex-col p-6">
                <p className="eyebrow text-[0.6rem]">{r.category}</p>
                <h3 className="mt-2 text-2xl">{r.title}</h3>
                {r.description && <p className="mt-2 flex-1 text-sm text-ivory-muted">{r.description}</p>}
                <div className="mt-5">
                  {locked ? <ButtonLink to="/login" size="sm" variant="outline"><Lock className="h-3.5 w-3.5" aria-hidden />Members only, sign in</ButtonLink>
                    : href ? <ButtonLink to={href} external size="sm" variant="outline">{r.file_url ? <Download className="h-3.5 w-3.5" aria-hidden /> : <ExternalLink className="h-3.5 w-3.5" aria-hidden />}{r.file_url ? "Download" : "Open"}</ButtonLink>
                    : <span className="text-xs text-ivory-muted">File not uploaded yet</span>}
                </div>
              </li>
            );
          })}
        </ul>
      </Section>
    </>
  );
}
