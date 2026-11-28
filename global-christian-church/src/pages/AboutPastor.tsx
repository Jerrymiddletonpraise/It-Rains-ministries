import { ArrowRight, Heart, Fingerprint, Sparkles, Sunrise } from "lucide-react";
import { useSeo } from "@/lib/seo";
import { useSettings } from "@/lib/data";
import { FOUNDED_ON, FOUNDER_NAME, founderCalling, founderIntro, founderQuote, founderStory } from "@/lib/founder";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal, Section, SectionHeading } from "@/components/ui/Misc";
import { ButtonLink } from "@/components/ui/Button";
import { PersonPhoto } from "@/components/Cards";

const CONVICTIONS = [
  { Icon: Heart, title: "Healing", body: "Every broken heart can be made whole by the love of God." },
  { Icon: Sunrise, title: "Hope", body: "No one is too lost to find their way home again." },
  { Icon: Fingerprint, title: "Identity", body: "Every person was created with divine design and purpose." },
  { Icon: Sparkles, title: "Awakening", body: "The gifts God placed within humanity are ready to be stirred up." },
];

export default function AboutPastor() {
  const { settings: { senior_pastor: p } } = useSettings();
  const name = p.name ?? FOUNDER_NAME;
  useSeo(`About the Pastor: ${name}`, `The story and calling of ${name}, founder of Global Christian Church.`);
  return (
    <>
      <PageHero eyebrow="About the pastor" title={name} intro={founderIntro} />

      <Section>
        <div className="grid items-start gap-12 lg:grid-cols-5">
          <Reveal className="relative mx-auto w-full max-w-md lg:col-span-2 lg:sticky lg:top-28">
            <div className="absolute -inset-4 rounded-[2rem] border border-gold/20" aria-hidden />
            <PersonPhoto src={p.photo_url} name={name} className="aspect-[4/5] w-full rounded-3xl shadow-luxe" />
            <p className="mt-6 text-center text-xs font-semibold uppercase tracking-[0.2em] text-gold-light">{p.title} · Founded {FOUNDED_ON}</p>
          </Reveal>
          <div className="lg:col-span-3">
            <Reveal>
              <p className="eyebrow mb-4">His story</p>
              <h2 className="text-4xl leading-[1.05] sm:text-5xl">It began when it seemed like <span className="gold-text italic">nothing was happening.</span></h2>
              <div className="gold-rule mt-6" />
            </Reveal>
            <div className="mt-8 space-y-6 text-lg leading-relaxed text-ivory-muted">
              {founderStory.map((t, i) => <Reveal key={i} delay={i * 80}><p className={i === 1 ? "font-display text-3xl italic leading-snug text-ivory" : ""}>{t}</p></Reveal>)}
            </div>
          </div>
        </div>
      </Section>

      <Section tone="charcoal">
        <div className="mx-auto max-w-3xl">
          <SectionHeading eyebrow="His calling" title={<>To reach humanity and remind people <span className="gold-text italic">who they truly are</span></>} />
          <div className="space-y-6 text-lg leading-relaxed text-ivory-muted">
            {founderCalling.map((t, i) => <Reveal key={i} delay={i * 80}><p>{t}</p></Reveal>)}
          </div>
          <Reveal as="div" className="mt-12 border-l-2 border-gold pl-6 sm:pl-8">
            <blockquote className="font-display text-3xl italic leading-snug text-ivory sm:text-4xl">“{founderQuote}”</blockquote>
          </Reveal>
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="What drives him" title="Four convictions" />
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CONVICTIONS.map(({ Icon, title, body }, i) => (
            <Reveal as="li" key={title} delay={i * 100} className="card-luxe p-7 text-center">
              <Icon className="mx-auto h-8 w-8 text-gold" aria-hidden />
              <h3 className="mt-5 text-3xl">{title}</h3>
              <p className="mt-3 text-sm text-ivory-muted">{body}</p>
            </Reveal>
          ))}
        </ul>
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <ButtonLink to="/vision-mission" variant="outline">Our vision and mission <ArrowRight className="h-4 w-4" aria-hidden /></ButtonLink>
          <ButtonLink to="/watch">Hear him preach, free</ButtonLink>
        </div>
      </Section>
    </>
  );
}
