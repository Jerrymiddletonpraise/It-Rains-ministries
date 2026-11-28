import { Link } from "react-router-dom";
import { ArrowRight, CalendarCheck, Compass, HandHeart, Radio } from "lucide-react";
import { useSeo } from "@/lib/seo";
import { useCollection, useSettings } from "@/lib/data";
import { demoBroadcast, demoEvents, demoMinistries, demoSermons, demoTestimonies } from "@/lib/demo";
import type { Broadcast, ChurchEvent, Ministry, Sermon, Testimony } from "@/lib/types";
import { ButtonLink } from "@/components/ui/Button";
import { DemoBadge, Reveal, Section, SectionHeading } from "@/components/ui/Misc";
import { Countdown, EventCard, MinistryCard, PersonPhoto, SermonCard, TestimonyCard } from "@/components/Cards";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { SocialLinks } from "@/components/layout/Footer";
import { formatDateTime } from "@/lib/utils";
import { FOUNDED_ON, FOUNDER_NAME, founderIntro, founderStory } from "@/lib/founder";
import { FreeWorshipBand, MissionGrid, WorldMessage } from "@/components/Founder";

const nowIso = () => new Date(Date.now() - 3 * 3600_000).toISOString();

export default function Home() {
  useSeo("Global Christian Church", `Global Christian Church, founded by ${FOUNDER_NAME}: a free online church for healing, restoration and the awakening of humanity. Watch live free from anywhere.`);
  const { settings: s } = useSettings();
  const sermons = useCollection<Sermon>("sermons", demoSermons.filter((x) => x.is_featured), { eq: { status: "published", is_featured: true }, order: "preached_on", limit: 3 });
  const events = useCollection<ChurchEvent>("events", demoEvents, { eq: { status: "published" }, gte: { starts_at: nowIso() }, order: "starts_at", ascending: true, limit: 4 });
  const ministries = useCollection<Ministry>("ministries", demoMinistries, { eq: { is_active: true }, order: "sort_order", ascending: true, limit: 6 });
  const testimonies = useCollection<Testimony>("published_testimonials", demoTestimonies, { order: "created_at", limit: 3 });
  const broadcasts = useCollection<Broadcast>("broadcast_schedules", [demoBroadcast], { gte: { scheduled_start: nowIso() }, order: "scheduled_start", ascending: true, limit: 1 });
  const next = broadcasts.data[0] ?? null;
  const pastor = s.senior_pastor;

  return (
    <>
      {/* HERO */}
      <section className="grain relative isolate flex min-h-[100svh] items-center overflow-hidden">
        {s.hero.video_url ? (
          <video className="absolute inset-0 -z-20 h-full w-full object-cover opacity-40" src={s.hero.video_url} autoPlay muted loop playsInline poster={s.hero.image_url ?? undefined} />
        ) : s.hero.image_url ? (
          <img src={s.hero.image_url} alt="" className="absolute inset-0 -z-20 h-full w-full animate-slow-zoom object-cover opacity-40" />
        ) : null}
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_55%_at_50%_15%,hsl(var(--gold)/0.28),transparent_65%),radial-gradient(ellipse_60%_40%_at_50%_110%,hsl(var(--gold-deep)/0.25),transparent_70%),linear-gradient(to_bottom,hsl(var(--ink)/0.2),hsl(var(--ink)))]" />
        <div aria-hidden className="absolute left-1/2 top-0 -z-10 h-[80vh] w-[140vw] -translate-x-1/2 animate-rays bg-[conic-gradient(from_180deg_at_50%_0%,transparent_38%,hsl(var(--gold-light)/0.14)_44%,transparent_47%,hsl(var(--gold-light)/0.1)_50%,transparent_53%,hsl(var(--gold-light)/0.12)_56%,transparent_62%)]" />
        <svg aria-hidden viewBox="0 0 800 800" className="absolute left-1/2 top-1/2 -z-10 w-[min(110vw,900px)] -translate-x-1/2 -translate-y-1/2 opacity-[0.09]">
          <g fill="none" stroke="hsl(39 47% 66%)" strokeWidth="1">
            <circle cx="400" cy="400" r="380" /><ellipse cx="400" cy="400" rx="180" ry="380" /><ellipse cx="400" cy="400" rx="300" ry="380" /><ellipse cx="400" cy="400" rx="60" ry="380" />
            <path d="M20 400h760M60 240h680M60 560h680M150 120h500M150 680h500" />
          </g>
        </svg>

        <div className="container pb-24 pt-36 text-center">
          <p className="eyebrow mb-8 animate-fade-up">Global Christian Church · Founded {FOUNDED_ON} by {FOUNDER_NAME}</p>
          <h1 className="mx-auto max-w-5xl animate-fade-up text-[2.9rem] font-medium uppercase leading-[0.98] tracking-[0.02em] [animation-delay:150ms] sm:text-7xl lg:text-[6.2rem]">
            <span className="block">One Faith.</span><span className="block">One Family.</span><span className="gold-text block italic normal-case">Reaching the World.</span>
          </h1>
          <p className="mx-auto mt-8 max-w-xl animate-fade-up text-base text-ivory-muted [animation-delay:300ms] sm:text-lg">{s.hero.subheadline}</p>
          <div className="mt-12 flex animate-fade-up flex-col items-center justify-center gap-4 [animation-delay:450ms] sm:flex-row">
            <ButtonLink to="/watch" size="lg"><Radio className="h-4 w-4" aria-hidden />Watch Live Free</ButtonLink>
            <ButtonLink to="/vision-mission" variant="outline" size="lg"><Compass className="h-4 w-4" aria-hidden />Discover the Vision</ButtonLink>
          </div>
          <p className="mx-auto mt-10 inline-flex animate-fade-up items-center gap-2 rounded-full border border-gold/30 bg-ink/40 px-5 py-2 text-xs text-ivory-muted backdrop-blur [animation-delay:600ms] sm:text-sm"><span className="font-semibold text-gold-light">100% free</span> No membership, no subscription, no paywall. Ever.</p>
        </div>
        <div aria-hidden className="absolute bottom-8 left-1/2 h-14 w-px -translate-x-1/2 bg-gradient-to-b from-gold to-transparent" />
      </section>

      {/* WELCOME */}
      <Section>
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="eyebrow mb-5">{s.welcome.title ?? "Welcome home"}</p>
          <p className="font-display text-3xl leading-snug text-ivory sm:text-[2.6rem]">
            {s.welcome.body ?? "Wherever you are in the world, you are welcome here. Join us in person or online and discover a family united in faith."}
          </p>
          {!s.welcome.body && <DemoBadge className="mt-6" />}
        </Reveal>
      </Section>

      {/* SENIOR PASTOR */}
      <Section tone="charcoal">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-4 rounded-[2rem] border border-gold/20" aria-hidden />
            <PersonPhoto src={pastor.photo_url} name={pastor.name ?? FOUNDER_NAME} className="aspect-[4/5] w-full rounded-3xl shadow-luxe" />
          </Reveal>
          <Reveal delay={150}>
            <p className="eyebrow mb-4">{pastor.title}</p>
            <h2 className="text-5xl">{pastor.name ?? FOUNDER_NAME}</h2>
            <div className="gold-rule mt-6" />
            <p className="mt-6 font-display text-2xl leading-snug text-ivory">{founderIntro}</p>
            <p className="mt-5 text-lg leading-relaxed text-ivory-muted">{founderStory[0]} {founderStory[1]}</p>
            <ButtonLink to="/about-the-pastor" variant="outline" className="mt-8">Read his story <ArrowRight className="h-4 w-4" aria-hidden /></ButtonLink>
          </Reveal>
        </div>
      </Section>

      {/* MISSION AND VISION */}
      <Section>
        <SectionHeading eyebrow="Our mission" title={<>Healing hearts. <span className="gold-text italic">Awakening purpose.</span></>} intro="A spiritual home where people from every background can find God, experience healing, discover their identity and grow into their divine purpose." />
        <MissionGrid />
        <div className="mt-10 text-center"><ButtonLink to="/vision-mission" variant="ghost">Read our vision and mission <ArrowRight className="h-4 w-4" aria-hidden /></ButtonLink></div>
      </Section>

      {/* UPCOMING SERVICE */}
      <section className="grain relative overflow-hidden border-y border-line bg-gradient-to-br from-charcoal via-ink to-charcoal py-20">
        <div aria-hidden className="absolute -right-40 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-gold/10 blur-3xl" />
        <div className="container relative grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="eyebrow mb-4 flex items-center gap-2"><Radio className="h-3.5 w-3.5" aria-hidden />GCC Worldwide Live</p>
            <h2 className="text-4xl sm:text-5xl">{next?.title ?? "Next service"}</h2>
            {next && <p className="mt-4 text-ivory-muted">{formatDateTime(next.scheduled_start)}</p>}
            {broadcasts.isDemo && <DemoBadge className="mt-4" label="Demo schedule" />}
          </div>
          <div className="flex flex-col items-start gap-6 lg:items-end">
            <Countdown target={next?.scheduled_start ?? null} />
            <div className="flex flex-wrap gap-3">
              <ButtonLink to="/watch"><Radio className="h-4 w-4" aria-hidden />Join the broadcast</ButtonLink>
              <ButtonLink to="/events" variant="outline"><CalendarCheck className="h-4 w-4" aria-hidden />Service schedule</ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <FreeWorshipBand />

      {/* FEATURED SERMONS */}
      <Section>
        <SectionHeading eyebrow="Sermon library" title="Featured messages" intro="Watch or listen on demand, from anywhere in the world." />
        {sermons.isDemo && <div className="mb-6 text-center"><DemoBadge /></div>}
        <div className="grid gap-6 md:grid-cols-3">{sermons.data.map((x, i) => <Reveal key={x.id} delay={i * 120}><SermonCard s={x} /></Reveal>)}</div>
        <div className="mt-12 text-center"><ButtonLink to="/sermons" variant="outline">Explore all sermons <ArrowRight className="h-4 w-4" aria-hidden /></ButtonLink></div>
      </Section>

      {/* MINISTRIES */}
      <Section tone="charcoal">
        <SectionHeading eyebrow="Find your place" title="Ministry highlights" intro="There is a place for every generation and every gift." />
        {ministries.isDemo && <div className="mb-6 text-center"><DemoBadge label="Demo descriptions" /></div>}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{ministries.data.slice(0, 6).map((m, i) => <Reveal key={m.id} delay={i * 80}><MinistryCard m={m} /></Reveal>)}</div>
        <div className="mt-12 text-center"><ButtonLink to="/ministries" variant="outline">All ministries <ArrowRight className="h-4 w-4" aria-hidden /></ButtonLink></div>
      </Section>

      {/* EVENTS */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <SectionHeading align="left" eyebrow="Calendar" title="Upcoming events" intro="Gatherings, services and special moments in the life of the church." className="mb-8" />
            {events.isDemo && <DemoBadge className="mb-6" />}
            <ButtonLink to="/events" variant="outline">View calendar <ArrowRight className="h-4 w-4" aria-hidden /></ButtonLink>
          </div>
          <div className="grid gap-4 lg:col-span-3">{events.data.slice(0, 4).map((e, i) => <Reveal key={e.id} delay={i * 80}><EventCard e={e} /></Reveal>)}</div>
        </div>
      </Section>

      {/* PRAYER */}
      <section className="grain relative isolate overflow-hidden py-28">
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,hsl(var(--gold)/0.18),transparent_60%)]" />
        <Reveal className="container max-w-3xl text-center">
          <HandHeart className="mx-auto h-10 w-10 text-gold" aria-hidden />
          <h2 className="mt-6 text-5xl sm:text-6xl">How can we pray for you?</h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-ivory-muted">Share your request privately with our prayer team, or invite the church family to stand with you.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4"><ButtonLink to="/prayer" size="lg">Submit a prayer request</ButtonLink><ButtonLink to="/prayer#care" variant="outline" size="lg">Request pastoral care</ButtonLink></div>
        </Reveal>
      </section>

      {/* TESTIMONIES */}
      <Section tone="charcoal">
        <SectionHeading eyebrow="Stories of faith" title="Testimonies" />
        {testimonies.isDemo && <div className="mb-6 text-center"><DemoBadge /></div>}
        <div className="grid gap-6 md:grid-cols-3">{testimonies.data.map((t, i) => <Reveal key={t.id} delay={i * 120}><TestimonyCard t={t} /></Reveal>)}</div>
        <div className="mt-12 text-center"><ButtonLink to="/testimonies" variant="outline">Read and share testimonies</ButtonLink></div>
      </Section>

      {/* GIVING */}
      <Section>
        <div className="card-luxe grid items-center gap-10 p-10 sm:p-14 lg:grid-cols-2 lg:hover:translate-y-0">
          <div>
            <p className="eyebrow mb-4">Give / Support · Optional</p>
            <h2 className="text-4xl sm:text-5xl">Partner with the mission</h2>
            <p className="mt-6 text-ivory-muted">For those who voluntarily wish to support the ministry: tithes, offerings, missions and special projects.</p>
            <p className="mt-4 text-sm font-semibold text-gold-light">Giving is always optional and never required to watch, join or belong.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {["Tithes", "Offerings", "Missions", "Building fund", "Benevolence", "Special projects"].map((c) => (
              <Link key={c} to="/give" className="rounded-xl border border-line px-4 py-4 text-ivory transition hover:border-gold hover:text-gold-light">{c}</Link>
            ))}
            <ButtonLink to="/give" className="col-span-2 mt-2">Give online</ButtonLink>
          </div>
        </div>
      </Section>

      {/* NEWSLETTER AND SOCIAL */}
      <Section tone="charcoal">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow mb-4">Newsletter</p>
            <h2 className="text-4xl">Stay connected</h2>
            <p className="mt-4 text-ivory-muted">News, events and encouragement, delivered to your inbox.</p>
            <div className="mt-8"><NewsletterForm /></div>
          </div>
          <div>
            <p className="eyebrow mb-4">Follow</p>
            <h2 className="text-4xl">Worship with us everywhere</h2>
            <p className="mb-8 mt-4 text-ivory-muted">Find Global Christian Church on your favourite platforms.</p>
            <SocialLinks />
          </div>
        </div>
      </Section>
      <WorldMessage />
    </>
  );
}
