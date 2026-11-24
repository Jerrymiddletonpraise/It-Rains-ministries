import type { Metadata } from "next";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { getSetting } from "@/lib/data";
import { Card, PageHero, Section } from "@/components/ui";
import { ContactForm } from "@/components/forms/ContactForm";
import { SocialLinks, WhatsappIcon } from "@/components/ui/SocialIcons";
import { env } from "@/lib/env";

export const metadata: Metadata = { title: "Contact Us" };
export const revalidate = 300;

export default async function Contact({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const [contact, social, services, sp] = await Promise.all([getSetting("contact"), getSetting("social"), getSetting("services"), searchParams]);
  const q = encodeURIComponent(contact.map_query || contact.address);
  const mapSrc = env.mapsKey
    ? `https://www.google.com/maps/embed/v1/place?key=${env.mapsKey}&q=${q}`
    : `https://maps.google.com/maps?q=${q}&output=embed`;
  return (
    <>
      <PageHero eyebrow="Contact us" title="We'd love to hear from you" intro="Questions, greetings, visits or partnership, our team is here for you." />
      <Section>
        <div className="grid gap-10 lg:grid-cols-[3fr_2fr]">
          <Card className="p-6 md:p-10">
            <h2 className="mb-6 font-serif text-3xl font-bold">Send us a message</h2>
            <ContactForm defaultKind={sp.kind === "greeting" ? "greeting" : "contact"} />
          </Card>
          <div className="space-y-5">
            <Card className="space-y-4">
              <p className="flex gap-3"><MapPin className="shrink-0 text-gold-600" />{contact.address}</p>
              <p className="flex gap-3"><Phone className="shrink-0 text-gold-600" /><a href={`tel:${contact.phone}`}>{contact.phone}</a></p>
              <p className="flex gap-3"><Mail className="shrink-0 text-gold-600" /><a href={`mailto:${contact.email}`}>{contact.email}</a></p>
              <p className="flex gap-3"><Clock className="shrink-0 text-gold-600" />{contact.office_hours}</p>
              {contact.whatsapp && (
                <a href={`https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 font-semibold text-white"><WhatsappIcon />Chat on WhatsApp</a>
              )}
            </Card>
            <Card>
              <h3 className="mb-3 font-serif text-2xl font-bold">Service times</h3>
              {services.map((s) => <p key={s.name} className="py-1"><span className="font-semibold text-royal-700">{s.day} {s.time}</span> · {s.name}</p>)}
            </Card>
            <div className="rounded-2xl bg-navy-900 p-6"><SocialLinks social={social} /></div>
          </div>
        </div>
        <div className="mt-10 overflow-hidden rounded-3xl shadow-lg">
          <iframe title="Church location map" src={mapSrc} className="h-80 w-full border-0 md:h-[28rem]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
        </div>
      </Section>
    </>
  );
}
