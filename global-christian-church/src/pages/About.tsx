import { ArrowRight } from "lucide-react";
import { useSeo } from "@/lib/seo";
import { useSettings } from "@/lib/data";
import { PageHero } from "@/components/ui/PageHero";
import { AwaitingBadge, Reveal, Section } from "@/components/ui/Misc";
import { ButtonLink } from "@/components/ui/Button";
import { FOUNDED_ON } from "@/lib/founder";

export default function About() {
  useSeo("About Global Christian Church", "Learn about Global Christian Church: One Faith. One Family. Reaching the World.");
  const { settings: s } = useSettings();
  return (
    <>
      <PageHero eyebrow={`Founded ${FOUNDED_ON}`} title="The beginning of the church" intro="What began as a vision planted in the spirit became a mission with a purpose." />
      <Section>
        <div className="mx-auto max-w-3xl">
          {s.about.body ? <div className="space-y-6 text-lg leading-relaxed text-ivory-muted">{s.about.body.split(/\n\n+/).map((t, i) => <Reveal key={i} delay={i * 60}><p className={i === 0 ? "font-display text-3xl text-ivory" : ""}>{t}</p></Reveal>)}</div> : (
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
            { to: "/about-the-pastor", title: "About the Pastor", body: "The story and calling of CHIEFPRO DON." },
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
