import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { getMedia } from "@/lib/data";
import { Empty, Heading, PageHero, Section, inputCls } from "@/components/ui";
import { SermonCard } from "@/components/cards";
import { MEDIA_CATEGORIES } from "@/lib/utils";

export const metadata: Metadata = { title: "Sermons and Media", description: "Watch and listen to sermons, Bible studies, prayer meetings and conferences from IT RAINS MINISTRIES." };
export const revalidate = 60;

export default async function Sermons({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const { q, category } = await searchParams;
  const cat = category && category in MEDIA_CATEGORIES ? category : undefined;
  const [items, featured] = await Promise.all([getMedia({ q: q?.slice(0, 80), category: cat, limit: 60 }), !q && !cat ? getMedia({ featured: true, limit: 3 }) : Promise.resolve([])]);
  return (
    <>
      <PageHero eyebrow="Media center" title="Sermons & Media" intro="Services, Bible studies, prayer meetings, conferences, teachings and resources.">
        <form className="mx-auto mt-8 flex max-w-xl gap-2" role="search">
          <label className="sr-only" htmlFor="q">Search sermons</label>
          <input id="q" name="q" defaultValue={q} placeholder="Search by title, speaker or scripture…" className={inputCls} />
          {cat && <input type="hidden" name="category" value={cat} />}
          <button className="flex items-center gap-2 rounded-xl bg-gold-500 px-5 font-semibold text-navy-950"><Search className="h-4 w-4" /><span className="hidden sm:inline">Search</span></button>
        </form>
      </PageHero>
      {featured.length > 0 && (
        <Section className="pb-0 md:pb-0">
          <Heading eyebrow="Featured" title="Featured messages" />
          <div className="grid gap-6 md:grid-cols-3">{featured.map((m) => <SermonCard key={m.id} m={m} />)}</div>
        </Section>
      )}
      <Section>
        <div className="mb-8 flex flex-wrap gap-2">
          <Link href="/sermons" className={`rounded-full px-4 py-2 text-sm font-semibold ${!cat ? "bg-royal-700 text-white" : "bg-white ring-1 ring-navy-900/10"}`}>All</Link>
          {Object.entries(MEDIA_CATEGORIES).map(([k, l]) => (
            <a key={k} href={`/sermons?category=${k}${q ? `&q=${encodeURIComponent(q)}` : ""}`} className={`rounded-full px-4 py-2 text-sm font-semibold ${cat === k ? "bg-royal-700 text-white" : "bg-white ring-1 ring-navy-900/10"}`}>{l}</a>
          ))}
        </div>
        {q && <p className="mb-6 text-navy-800/70">{items.length} result{items.length === 1 ? "" : "s"} for &ldquo;{q}&rdquo;</p>}
        {items.length ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{items.map((m) => <SermonCard key={m.id} m={m} />)}</div>
          : <Empty title={q ? "No matches found" : "Nothing here yet"}>{q ? "Try a different search." : "New media is published regularly."}</Empty>}
      </Section>
    </>
  );
}
