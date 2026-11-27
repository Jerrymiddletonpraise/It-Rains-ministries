import { useSeo } from "@/lib/seo";
import { useSettings } from "@/lib/data";
import { PageHero } from "@/components/ui/PageHero";
import { AwaitingBadge, Reveal, Section } from "@/components/ui/Misc";

export default function Beliefs() {
  useSeo("What We Believe", "The statement of faith of Global Christian Church.");
  const { settings: { beliefs } } = useSettings();
  return (
    <>
      <PageHero eyebrow="Statement of faith" title="What We Believe" intro={beliefs.intro ?? undefined} />
      <Section>
        <div className="mx-auto max-w-3xl">
          {beliefs.items.length ? (
            <ol className="space-y-6">
              {beliefs.items.map((b, i) => (
                <Reveal as="li" key={b.title} delay={i * 60} className="card-luxe flex gap-6 p-8 lg:hover:translate-y-0">
                  <span className="font-display text-4xl text-gold">{String(i + 1).padStart(2, "0")}</span>
                  <div><h2 className="text-3xl">{b.title}</h2><p className="mt-3 whitespace-pre-line leading-relaxed text-ivory-muted">{b.body}</p></div>
                </Reveal>
              ))}
            </ol>
          ) : (
            <div className="rounded-2xl border border-dashed border-line p-10 text-center">
              <AwaitingBadge label="Awaiting church leadership" />
              <p className="mt-6 font-display text-3xl">Statement of faith coming soon</p>
              <p className="mt-4 text-ivory-muted">Global Christian Church’s beliefs will be published here exactly as approved by church leadership. This website does not write doctrinal statements on the church’s behalf.</p>
            </div>
          )}
        </div>
      </Section>
    </>
  );
}
