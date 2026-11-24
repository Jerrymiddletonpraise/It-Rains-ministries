import Link from "next/link";
import { Clock, HandHeart, Gift, Megaphone, Quote, Radio, Globe, Mail, Phone, MapPin } from "lucide-react";
import { detectYoutubeLive } from "@/lib/youtube";
import { getAnnouncements, getCurrentStream, getDepartments, getMedia, getSetting, getTestimonies, getUpcomingEvents } from "@/lib/data";
import { ButtonLink, Card, Empty, Heading, Section } from "@/components/ui";
import { DepartmentCard, EventCard, SermonCard } from "@/components/cards";
import { Rain } from "@/components/home/Rain";
import { LogoMark } from "@/components/ui/Logo";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { PrayerForm } from "@/components/forms/PrayerForm";
import { SocialLinks } from "@/components/ui/SocialIcons";
import { formatDateTime, FUNDS } from "@/lib/utils";

export const revalidate = 60;

export default async function Home() {
  const [home, services, contact, social, stream, sermons, events, departments, testimonies, announcements] = await Promise.all([
    getSetting("home"), getSetting("services"), getSetting("contact"), getSetting("social"), getCurrentStream(),
    getMedia({ limit: 3 }), getUpcomingEvents(4), getDepartments(), getTestimonies(3), getAnnouncements(3),
  ]);
  const yt = stream && ["live", "paused"].includes(stream.status) ? null : await detectYoutubeLive(social.youtube);
  const shown = yt ? { title: yt.title, status: "live", scheduled_for: null } : stream;
  const live = shown?.status === "live";

  return (
    <>
      {/* HERO */}
      <section className="bg-heaven relative flex min-h-[100svh] items-center overflow-hidden px-4 pb-16 pt-28 sm:px-6">
        {home.hero_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={home.hero_image_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-luminosity" />
        )}
        <Rain />
        <div className="relative mx-auto w-full max-w-5xl text-center">
          <LogoMark className="mx-auto mb-8 h-20 w-20 animate-fade-up drop-shadow-[0_0_30px_rgba(212,175,55,0.45)]" />
          <p className="animate-fade-up text-xs font-bold uppercase tracking-[0.4em] text-gold-400 sm:text-sm">Welcome home</p>
          <h1 className="mt-4 animate-fade-up font-serif text-5xl font-bold leading-[1.05] text-white [animation-delay:120ms] sm:text-6xl md:text-7xl lg:text-8xl">
            {home.hero_title.replace("IT RAINS MINISTRIES", "")}
            <span className="text-brand-name mt-3 block font-display text-[2.1rem] font-black uppercase leading-[1.05] tracking-[0.04em] sm:text-5xl md:text-6xl lg:text-7xl">IT RAINS<span className="block text-[0.42em] font-semibold tracking-[0.5em]">MINISTRIES</span></span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl animate-fade-up font-serif text-2xl italic text-white/85 [animation-delay:240ms] md:text-3xl">{home.hero_subtitle}</p>
          <div className="mt-10 flex animate-fade-up flex-col items-center justify-center gap-3 [animation-delay:360ms] sm:flex-row">
            <ButtonLink href="/watch" className="w-full px-8 py-4 text-base sm:w-auto">
              <span className={`h-3 w-3 rounded-full ${live ? "animate-pulse-ring bg-red-600" : "bg-navy-950/40"}`} />
              {live ? "WATCH LIVE NOW" : "WATCH LIVE"}
            </ButtonLink>
            <ButtonLink href="/give" variant="outline" className="w-full px-8 py-4 text-base sm:w-auto">Give Online</ButtonLink>
            <ButtonLink href="/prayer" variant="ghost" className="w-full px-8 py-4 text-base text-white hover:bg-white/10 sm:w-auto">Request Prayer</ButtonLink>
          </div>
          <LiveStrip stream={shown} />
        </div>
      </section>

      {/* SERVICE TIMES */}
      <div className="relative z-10 -mt-12 px-4 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-px overflow-hidden rounded-2xl bg-navy-900/10 shadow-2xl sm:grid-cols-3">
          {services.map((s) => (
            <div key={s.name} className="flex items-center gap-4 bg-white p-6">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-royal-100 text-royal-700"><Clock /></span>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gold-600">{s.day} · {s.time}</p>
                <p className="font-serif text-xl font-bold">{s.name}</p>
                {s.online && <p className="text-xs text-navy-800/60">In person & streamed live</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PASTOR WELCOME */}
      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-4 rotate-3 rounded-[2rem] bg-gradient-to-br from-gold-400 to-royal-700 opacity-80" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-heaven">
              {home.pastor_photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={home.pastor_photo_url} alt={home.pastor_name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center"><LogoMark className="h-32 w-32 opacity-80" /></div>
              )}
            </div>
          </div>
          <div>
            <Heading eyebrow="A word of welcome" title="You are not here by accident" />
            <Quote className="mb-4 h-10 w-10 text-gold-500" />
            <p className="font-serif text-2xl leading-relaxed text-navy-800">{home.pastor_message}</p>
            <p className="mt-6 font-serif text-xl font-bold text-royal-800">{home.pastor_name}</p>
            <p className="text-sm text-navy-800/60">{home.pastor_title}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/pastor" variant="purple">Meet our pastor</ButtonLink>
              <ButtonLink href="/about" variant="ghost">Our story</ButtonLink>
            </div>
          </div>
        </div>
      </Section>

      {/* ANNOUNCEMENTS */}
      {announcements.length > 0 && (
        <Section className="bg-royal-100/60 py-12 md:py-16">
          <div className="mb-6 flex items-center gap-3"><Megaphone className="text-royal-700" /><h2 className="font-serif text-3xl font-bold">Ministry Announcements</h2></div>
          <div className="grid gap-4 md:grid-cols-3">
            {announcements.map((a) => (
              <Card key={a.id} className={a.pinned ? "ring-2 ring-gold-500" : ""}>
                <h3 className="font-serif text-xl font-bold">{a.title}</h3>
                <p className="mt-2 whitespace-pre-line text-sm text-navy-800/80">{a.body}</p>
                {a.link_url && <a href={a.link_url} className="mt-3 inline-block text-sm font-semibold text-royal-700">Learn more →</a>}
              </Card>
            ))}
          </div>
        </Section>
      )}

      {/* SERMONS */}
      <Section className="bg-white">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <Heading eyebrow="Sermons & messages" title="Latest from the pulpit" intro="Be fed by the Word wherever you are. Watch, listen or download." />
          <ButtonLink href="/sermons" variant="purple" className="mb-10 self-start md:self-auto">Browse the media library</ButtonLink>
        </div>
        {sermons.length ? (
          <div className="grid gap-6 md:grid-cols-3">{sermons.map((m) => <SermonCard key={m.id} m={m} />)}</div>
        ) : <Empty title="Sermons are coming soon">Recorded services will appear here after they are published.</Empty>}
      </Section>

      {/* MINISTRIES */}
      <Section className="bg-heaven">
        <Heading light center eyebrow="Featured ministries" title="Find your place in the family" intro="Thirteen ministries serving every age and season of life." />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{departments.slice(0, 6).map((d) => <DepartmentCard key={d.slug} d={d} />)}</div>
        <div className="mt-10 text-center"><ButtonLink href="/ministries" variant="outline">See all ministries</ButtonLink></div>
      </Section>

      {/* EVENTS */}
      <Section>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <Heading eyebrow="Conferences & events" title="Upcoming gatherings" />
          <ButtonLink href="/events" variant="purple" className="mb-10 self-start md:self-auto">All events</ButtonLink>
        </div>
        {events.length ? <div className="grid gap-5 md:grid-cols-2">{events.map((e) => <EventCard key={e.id} e={e} />)}</div>
          : <Empty title="New events will be announced soon">Subscribe to our newsletter to hear first.</Empty>}
      </Section>

      {/* PRAYER + GIVING */}
      <Section className="bg-white">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl bg-royal-800 p-8 text-white md:p-10">
            <HandHeart className="h-10 w-10 text-gold-400" />
            <h2 className="mt-4 font-serif text-4xl font-bold">How can we pray for you?</h2>
            <p className="mt-3 text-white/75">Every request is read and prayed over by our intercessors and kept confidential.</p>
            <div className="mt-6 rounded-2xl bg-white p-5 text-navy-900"><PrayerForm compact /></div>
          </div>
          <div className="flex flex-col rounded-3xl bg-navy-900 p-8 text-white md:p-10">
            <Gift className="h-10 w-10 text-gold-400" />
            <h2 className="mt-4 font-serif text-4xl font-bold">Partner with the vision</h2>
            <p className="mt-3 text-white/75">&ldquo;Give, and it shall be given unto you; good measure, pressed down, and shaken together, and running over.&rdquo; Luke 6:38</p>
            <div className="mt-8 grid flex-1 gap-3 sm:grid-cols-2">
              {Object.entries(FUNDS).map(([k, f]) => (
                <Link key={k} href={`/give?fund=${k}`} className="rounded-2xl border border-white/10 p-4 transition hover:border-gold-500 hover:bg-white/5">
                  <p className="font-serif text-xl font-bold text-gold-400">{f.label}</p>
                  <p className="text-sm text-white/65">{f.description}</p>
                </Link>
              ))}
            </div>
            <ButtonLink href="/give" className="mt-6 self-start">Give securely online</ButtonLink>
          </div>
        </div>
      </Section>

      {/* TESTIMONIES */}
      <Section>
        <Heading center eyebrow="Transformed lives" title="Testimonies of His goodness" />
        {testimonies.length ? (
          <div className="grid gap-6 md:grid-cols-3">
            {testimonies.map((t) => (
              <Card key={t.id} className="flex flex-col">
                <Quote className="h-8 w-8 text-gold-500" />
                <h3 className="mt-3 font-serif text-xl font-bold">{t.title}</h3>
                <p className="mt-2 line-clamp-6 flex-1 text-navy-800/80">{t.body}</p>
                <p className="mt-4 text-sm font-semibold text-royal-700">{t.show_name ? t.name : "A grateful believer"}{t.location ? ` · ${t.location}` : ""}</p>
              </Card>
            ))}
          </div>
        ) : <Empty title="Be the first to share">Your story could encourage someone across the world.</Empty>}
        <div className="mt-10 flex justify-center gap-3"><ButtonLink href="/testimonies" variant="purple">Read & share testimonies</ButtonLink></div>
      </Section>

      {/* CONNECT */}
      <Section className="bg-heaven">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Heading light eyebrow="Stay connected" title="Never miss a move of God" intro="Get service reminders, event news and encouragement in your inbox." />
            <div className="max-w-lg"><NewsletterForm dark /></div>
            <SocialLinks social={social} className="mt-8 flex gap-3" />
          </div>
          <div className="space-y-4 rounded-2xl bg-white/5 p-6 text-white/85 ring-1 ring-white/10">
            <h3 className="font-serif text-2xl text-white">Contact us</h3>
            <p className="flex gap-3"><MapPin className="shrink-0 text-gold-400" />{contact.address}</p>
            <p className="flex gap-3"><Phone className="shrink-0 text-gold-400" /><a href={`tel:${contact.phone}`}>{contact.phone}</a></p>
            <p className="flex gap-3"><Mail className="shrink-0 text-gold-400" /><a href={`mailto:${contact.email}`}>{contact.email}</a></p>
            <ButtonLink href="/contact" variant="outline">Send a message</ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}

function LiveStrip({ stream }: { stream: { title: string; status: string; scheduled_for: string | null } | null }) {
  if (!stream) return (
    <p className="mt-10 flex items-center justify-center gap-2 text-sm text-white/60"><Globe className="h-4 w-4" />Join us online from any nation, every service is streamed live.</p>
  );
  const live = stream.status === "live";
  return (
    <Link href="/watch" className="mx-auto mt-10 flex max-w-xl items-center gap-4 rounded-2xl bg-white/10 p-4 text-left text-white ring-1 ring-white/15 backdrop-blur transition hover:bg-white/15">
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${live ? "bg-red-600" : "bg-royal-700"}`}><Radio /></span>
      <span>
        <span className="block text-xs font-bold uppercase tracking-widest text-gold-400">{live ? "Live now" : stream.status === "paused" ? "Stream paused" : "Next live broadcast"}</span>
        <span className="block font-semibold">{stream.title}</span>
        {!live && stream.scheduled_for && <span className="block text-sm text-white/65">{formatDateTime(stream.scheduled_for)}</span>}
      </span>
    </Link>
  );
}
