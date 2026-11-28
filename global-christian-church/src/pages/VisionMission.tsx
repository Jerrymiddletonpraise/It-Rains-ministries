import { ArrowRight, Globe2, HeartHandshake, LockOpen } from "lucide-react";
import { useSeo } from "@/lib/seo";
import { useSettings } from "@/lib/data";
import { beginning, FOUNDED_ON, FOUNDER_NAME } from "@/lib/founder";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal, Section, SectionHeading } from "@/components/ui/Misc";
import { ButtonLink } from "@/components/ui/Button";
import { FreeWorshipBand, MissionGrid } from "@/components/Founder";

const WELCOME = [
  { Icon: Globe2, title: "Every nation", body: "Our doors, online and in person, are open to the whole world." },
  { Icon: LockOpen, title: "Every circumstance", body: "Your finances never limit your access to worship or teaching." },
  { Icon: HeartHandshake, title: "Every story", body: "Your past does not determine your future. There is room here for you." },
];

export default function VisionMission() {
  useSeo("Our Vision and Mission", "Why Global Christian Church was established, and what we stand for.");
  const { settings: { mission_vision: mv } } = useSettings();
  return (
    <>
      <PageHero eyebrow="Why we exist" title={<>Planted in the spirit <span className="gold-text italic">before it was ever seen</span></>} intro="Why the ministry was established, and what we stand for." />

      <Section>
        <div className="grid gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow mb-4">Our vision</p>
            <h2 className="text-4xl leading-[1.05] sm:text-5xl">A spiritual home for every person</h2>
            <div className="gold-rule mt-6" />
            {mv.vision && <p className="mt-8 font-display text-3xl leading-snug text-ivory">{mv.vision}</p>}
            <div className="mt-8 space-y-5 text-lg leading-relaxed text-ivory-muted">{beginning.slice(2).map((t) => <p key={t}>{t}</p>)}</div>
          </Reveal>
          <Reveal delay={150}>
            <ol className="relative ml-3 space-y-10 border-l border-gold/40 pl-8">
              {[
                { t: "The seed", b: `A vision planted deep in the spirit of ${FOUNDER_NAME}: clear, impossible to forget, alive even when nothing seemed to be happening.` },
                { t: FOUNDED_ON, b: "Global Christian Church was officially founded, and the vision became a mission with a purpose." },
                { t: "The movement", b: "A worldwide family of faith, love, restoration and spiritual awakening, reaching every nation through free digital ministry." },
              ].map((x) => (
                <li key={x.t} className="relative">
                  <span aria-hidden className="absolute -left-[2.45rem] top-1.5 h-4 w-4 rounded-full border-4 border-ink bg-gold" />
                  <p className="font-display text-3xl text-ivory">{x.t}</p>
                  <p className="mt-2 text-ivory-muted">{x.b}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </Section>

      <Section tone="charcoal">
        <SectionHeading eyebrow="Our mission" title="What we stand for" intro={mv.mission ?? undefined} />
        <MissionGrid />
      </Section>

      <Section>
        <SectionHeading eyebrow="Everyone is welcome" title="Whoever you are, wherever you are from" intro="We welcome everyone, regardless of their background, financial situation, nationality or life experiences." />
        <ul className="grid gap-5 md:grid-cols-3">
          {WELCOME.map(({ Icon, title, body }, i) => (
            <Reveal as="li" key={title} delay={i * 100} className="card-luxe p-8 text-center">
              <Icon className="mx-auto h-8 w-8 text-gold" aria-hidden /><h3 className="mt-5 text-3xl">{title}</h3><p className="mt-3 text-sm text-ivory-muted">{body}</p>
            </Reveal>
          ))}
        </ul>
        <Reveal className="mx-auto mt-16 max-w-3xl text-center">
          <p className="font-display text-3xl italic leading-snug text-gold-light sm:text-4xl">This is more than a church building. It is a movement of faith, love, restoration, and spiritual awakening.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4"><ButtonLink to="/about-the-pastor" variant="outline">Meet {FOUNDER_NAME} <ArrowRight className="h-4 w-4" aria-hidden /></ButtonLink><ButtonLink to="/watch">Join a service free</ButtonLink></div>
        </Reveal>
      </Section>
      <FreeWorshipBand />
    </>
  );
}
