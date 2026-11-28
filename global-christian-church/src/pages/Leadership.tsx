import { Mail } from "lucide-react";
import { useSeo } from "@/lib/seo";
import { useCollection, useSettings } from "@/lib/data";
import { demoLeaders } from "@/lib/demo";
import type { Leader } from "@/lib/types";
import { PageHero } from "@/components/ui/PageHero";
import { AwaitingBadge, DemoBadge, Reveal, Section, SectionHeading } from "@/components/ui/Misc";
import { PersonPhoto } from "@/components/Cards";
import { ButtonLink } from "@/components/ui/Button";

export default function Leadership() {
  useSeo("Leadership", "Meet the Senior Pastor and leadership team of Global Christian Church.");
  const { settings: { senior_pastor: p } } = useSettings();
  const leaders = useCollection<Leader>("leaders", demoLeaders, { eq: { is_published: true }, order: "sort_order", ascending: true });
  return (
    <>
      <PageHero eyebrow="Leadership" title="Shepherds of the family" />
      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-5">
          <Reveal className="lg:col-span-2"><PersonPhoto src={p.photo_url} name={p.name ?? "Senior Pastor"} className="aspect-[4/5] w-full rounded-3xl shadow-luxe" /></Reveal>
          <Reveal delay={120} className="lg:col-span-3">
            <p className="eyebrow mb-3">{p.title}</p>
            <h2 className="text-5xl">{p.name ?? "Senior Pastor"}</h2>
            <div className="gold-rule mt-6" />
            {p.bio ? <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-ivory-muted">{p.bio}</p> : (
              <><AwaitingBadge className="mt-6" label="Awaiting official information" /><p className="mt-4 text-ivory-muted">The Senior Pastor’s profile is edited from the GCC Control Center under Website settings.</p></>
            )}
            <ButtonLink to="/about-the-pastor" variant="outline" className="mt-8 mr-4">Read his full story</ButtonLink>
            {p.email && <a href={`mailto:${p.email}`} className="mt-6 inline-flex items-center gap-2 text-gold hover:underline"><Mail className="h-4 w-4" aria-hidden />{p.email}</a>}
          </Reveal>
        </div>
      </Section>
      <Section tone="charcoal">
        <SectionHeading eyebrow="Our team" title="Pastors and leaders" />
        {leaders.isDemo && <div className="mb-8 text-center"><DemoBadge label="Demo placeholders" /></div>}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {leaders.data.map((l, i) => (
            <Reveal key={l.id} delay={i * 80} className="card-luxe">
              <PersonPhoto src={l.photo_url} name={l.name} className="aspect-[4/3] w-full" />
              <div className="p-6"><p className="eyebrow text-[0.6rem]">{l.title}</p><h3 className="mt-2 text-2xl">{l.name}</h3>{l.bio && <p className="mt-3 text-sm text-ivory-muted">{l.bio}</p>}</div>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}
