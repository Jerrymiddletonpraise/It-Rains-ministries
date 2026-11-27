import { useSeo } from "@/lib/seo";
import { useSettings } from "@/lib/data";
import { PageHero } from "@/components/ui/PageHero";
import { AwaitingBadge, Reveal, Section } from "@/components/ui/Misc";

export default function VisionMission() {
  useSeo("Our Vision and Mission", "The vision and mission of Global Christian Church.");
  const { settings: { mission_vision: mv, church_profile } } = useSettings();
  const block = (label: string, text: string | null) => (
    <Reveal className="card-luxe p-10 lg:hover:translate-y-0">
      <p className="eyebrow mb-4">{label}</p>
      {text ? <p className="font-display text-3xl leading-snug sm:text-4xl">{text}</p> : (
        <><AwaitingBadge label="Awaiting official statement" /><p className="mt-4 text-ivory-muted">Church leadership will publish the official {label.toLowerCase()} statement here.</p></>
      )}
    </Reveal>
  );
  return (
    <>
      <PageHero eyebrow="Why we exist" title="Our Vision and Mission" intro={church_profile.tagline} />
      <Section>
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">{block("Mission", mv.mission)}{block("Vision", mv.vision)}</div>
        {mv.values.length > 0 && (
          <div className="mx-auto mt-16 max-w-5xl">
            <h2 className="mb-8 text-center text-4xl">Our values</h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{mv.values.map((v) => <li key={v} className="rounded-xl border border-line p-6 font-display text-2xl">{v}</li>)}</ul>
          </div>
        )}
      </Section>
    </>
  );
}
