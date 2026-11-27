import { useSeo } from "@/lib/seo";
import { useCollection } from "@/lib/data";
import { demoDevotionals } from "@/lib/demo";
import type { Devotional } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { PageHero } from "@/components/ui/PageHero";
import { DemoBadge, Reveal, Section } from "@/components/ui/Misc";

export default function Devotionals() {
  useSeo("Daily Devotionals", "A daily word of encouragement and scripture from Global Christian Church.");
  const d = useCollection<Devotional>("devotionals", demoDevotionals, { eq: { status: "published" }, order: "publish_on", limit: 14 });
  const [today, ...past] = d.data.filter((x) => new Date(x.publish_on) <= new Date(Date.now() + 864e5));
  return (
    <>
      <PageHero eyebrow="A word for today" title="Daily Devotionals" />
      <Section>
        {d.isDemo && <div className="mb-8 text-center"><DemoBadge label="Demo devotional text, KJV scripture" /></div>}
        {today && (
          <Reveal as="article" className="mx-auto max-w-3xl">
            <p className="eyebrow text-center">{formatDate(today.publish_on, { dateStyle: "full" })}</p>
            <h2 className="mt-4 text-center text-5xl">{today.title}</h2>
            {today.scripture_text && (
              <blockquote className="my-10 border-l-2 border-gold pl-6">
                <p className="font-display text-2xl italic leading-relaxed">“{today.scripture_text}”</p>
                <footer className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-gold-light">{today.scripture_reference}</footer>
              </blockquote>
            )}
            <div className="whitespace-pre-line text-lg leading-relaxed text-ivory-muted">{today.body}</div>
            {today.author && <p className="mt-8 text-sm text-gold-light">by {today.author}</p>}
          </Reveal>
        )}
      </Section>
      {past.length > 0 && (
        <Section tone="charcoal">
          <h2 className="mb-8 text-center text-4xl">Recent devotionals</h2>
          <ul className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2">
            {past.map((p) => <li key={p.id} className="card-luxe p-6"><p className="eyebrow text-[0.6rem]">{formatDate(p.publish_on)}</p><h3 className="mt-2 text-2xl">{p.title}</h3><p className="mt-2 text-sm text-gold-light">{p.scripture_reference}</p><p className="mt-3 line-clamp-3 text-sm text-ivory-muted">{p.body}</p></li>)}
          </ul>
        </Section>
      )}
    </>
  );
}
