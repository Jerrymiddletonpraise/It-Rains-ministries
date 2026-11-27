import { ArrowRight } from "lucide-react";
import { useSeo } from "@/lib/seo";
import { useSettings } from "@/lib/data";
import { PageHero } from "@/components/ui/PageHero";
import { AwaitingBadge, Reveal, Section } from "@/components/ui/Misc";
import { ButtonLink } from "@/components/ui/Button";

export default function About() {
  useSeo("About Global Christian Church", "Learn about Global Christian Church: One Faith. One Family. Reaching the World.");
  const { settings: s } = useSettings();
  return (
    <>
      <PageHero eyebrow="About us" title="About Global Christian Church" intro={s.church_profile.tagline} />
      <Section>
        <div className="mx-auto max-w-3xl">
          {s.about.body ? <div className="prose-luxe whitespace-pre-line text-lg">{s.about.body}</div> : (
            <Reveal className="rounded-2xl border border-dashed border-line p-10 text-center">
              <AwaitingBadge label="Awaiting official information" />
              <p className="mt-6 font-display text-3xl">Our story is being written here</p>
              <p className="mt-4 text-ivory-muted">The church’s history and introduction will be published by church leadership from the GCC Control Center. We do not publish details that the church has not provided.</p>
            </Reveal>
          )}
        </div>
      </Section>
      <Section tone="charcoal">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { to: "/vision-mission", title: "Vision and Mission", body: "Why Global Christian Church exists." },
            { to: "/beliefs", title: "What We Believe", body: "The church’s statement of faith." },
            { to: "/leadership", title: "Leadership", body: "Meet the pastors and leaders." },
          ].map((c, i) => (
            <Reveal key={c.to} delay={i * 100} className="card-luxe p-8">
              <h2 className="text-3xl">{c.title}</h2><p className="mt-3 text-sm text-ivory-muted">{c.body}</p>
              <ButtonLink to={c.to} variant="ghost" className="-ml-4 mt-6">Learn more <ArrowRight className="h-4 w-4" aria-hidden /></ButtonLink>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}
