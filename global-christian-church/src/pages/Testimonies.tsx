import { useSeo } from "@/lib/seo";
import { useCollection } from "@/lib/data";
import { demoTestimonies } from "@/lib/demo";
import type { Testimony } from "@/lib/types";
import { PageHero } from "@/components/ui/PageHero";
import { DemoBadge, Reveal, Section, SectionHeading } from "@/components/ui/Misc";
import { TestimonyCard } from "@/components/Cards";
import { TestimonyForm } from "@/components/forms/TestimonyForm";

export default function Testimonies() {
  useSeo("Testimonies", "Stories of faith from the Global Christian Church family.");
  const t = useCollection<Testimony>("published_testimonials", demoTestimonies, { order: "created_at" });
  return (
    <>
      <PageHero eyebrow="Stories of faith" title="Testimonies" intro="What God is doing in the lives of our church family around the world." />
      <Section>
        {t.isDemo && <div className="mb-8 text-center"><DemoBadge /></div>}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{t.data.map((x, i) => <Reveal key={x.id} delay={(i % 3) * 100}><TestimonyCard t={x} /></Reveal>)}</div>
      </Section>
      <Section tone="charcoal"><div className="mx-auto max-w-3xl"><SectionHeading eyebrow="Share" title="Share your testimony" intro="Testimonies are reviewed before they are published." /><TestimonyForm /></div></Section>
    </>
  );
}
