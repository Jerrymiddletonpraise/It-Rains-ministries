import { Baby, Clock, MapPin, Shirt, Video } from "lucide-react";
import { useSeo } from "@/lib/seo";
import { useSettings } from "@/lib/data";
import { PageHero } from "@/components/ui/PageHero";
import { AwaitingBadge, Reveal, Section, SectionHeading } from "@/components/ui/Misc";
import { ButtonLink } from "@/components/ui/Button";
import { VisitForm } from "@/components/forms/VisitForm";

export default function Visit() {
  useSeo("First-Time Visitors", "Plan your first visit to Global Christian Church, in person or online.");
  const { settings: s } = useSettings();
  return (
    <>
      <PageHero eyebrow="Plan your visit" title="We saved you a seat" intro="Whether you join us in person or online, we cannot wait to meet you." />
      <Section>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Reveal className="card-luxe p-7"><Clock className="h-6 w-6 text-gold" aria-hidden /><h2 className="mt-4 text-2xl">Service times</h2>
            {s.service_times.length ? <ul className="mt-3 space-y-1 text-sm text-ivory-muted">{s.service_times.map((t) => <li key={t.label}>{t.label}: {t.day} {t.time}</li>)}</ul> : <AwaitingBadge className="mt-3" label="Awaiting official times" />}</Reveal>
          <Reveal delay={80} className="card-luxe p-7"><MapPin className="h-6 w-6 text-gold" aria-hidden /><h2 className="mt-4 text-2xl">Location</h2>
            {s.church_profile.address ? <p className="mt-3 text-sm text-ivory-muted">{s.church_profile.address}</p> : <AwaitingBadge className="mt-3" label="Awaiting address" />}</Reveal>
          <Reveal delay={160} className="card-luxe p-7"><Baby className="h-6 w-6 text-gold" aria-hidden /><h2 className="mt-4 text-2xl">Children</h2><p className="mt-3 text-sm text-ivory-muted">Let us know you are bringing children and we will share children’s ministry details before you arrive.</p></Reveal>
          <Reveal delay={240} className="card-luxe p-7"><Shirt className="h-6 w-6 text-gold" aria-hidden /><h2 className="mt-4 text-2xl">What to expect</h2><p className="mt-3 text-sm text-ivory-muted">Come as you are. Our welcome team will help you find your way.</p></Reveal>
        </div>
        <div className="mt-10 flex justify-center"><ButtonLink to="/watch" variant="outline"><Video className="h-4 w-4" aria-hidden />Prefer online? Watch live</ButtonLink></div>
      </Section>
      <Section tone="charcoal"><div className="mx-auto max-w-3xl"><SectionHeading eyebrow="Let us know" title="Plan your visit" intro="Tell us when you are coming and our welcome team will be ready for you." /><VisitForm /></div></Section>
    </>
  );
}
