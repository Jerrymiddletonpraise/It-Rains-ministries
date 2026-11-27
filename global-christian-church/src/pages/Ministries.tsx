import { useSeo } from "@/lib/seo";
import { useCollection } from "@/lib/data";
import { demoMinistries } from "@/lib/demo";
import type { Ministry } from "@/lib/types";
import { PageHero } from "@/components/ui/PageHero";
import { DemoBadge, Reveal, Section } from "@/components/ui/Misc";
import { MinistryCard } from "@/components/Cards";

export default function Ministries() {
  useSeo("Ministries", "Find your place in the ministries of Global Christian Church.");
  const m = useCollection<Ministry>("ministries", demoMinistries, { eq: { is_active: true }, order: "sort_order", ascending: true });
  return (
    <>
      <PageHero eyebrow="Find your place" title="Ministries" intro="Every generation, every gift, one family." />
      <Section>
        {m.isDemo && <div className="mb-8 text-center"><DemoBadge label="Demo descriptions" /></div>}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{m.data.map((x, i) => <Reveal key={x.id} delay={(i % 6) * 60}><MinistryCard m={x} /></Reveal>)}</div>
      </Section>
    </>
  );
}
