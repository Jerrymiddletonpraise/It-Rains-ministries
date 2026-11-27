import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useSeo } from "@/lib/seo";
import { useSettings } from "@/lib/data";
import { PageHero } from "@/components/ui/PageHero";
import { AwaitingBadge, Section } from "@/components/ui/Misc";
import { ContactForm } from "@/components/forms/ContactForm";
import { SocialLinks } from "@/components/layout/Footer";

export default function Contact() {
  useSeo("Contact Us", "Get in touch with Global Christian Church.");
  const { settings: { church_profile: p } } = useSettings();
  const rows = [
    { Icon: MapPin, label: "Address", value: p.address, href: p.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.address)}` : null },
    { Icon: Phone, label: "Phone", value: p.phone, href: p.phone ? `tel:${p.phone}` : null },
    { Icon: Mail, label: "Email", value: p.email, href: p.email ? `mailto:${p.email}` : null },
    { Icon: MessageCircle, label: "WhatsApp", value: p.whatsapp, href: p.whatsapp ? `https://wa.me/${p.whatsapp.replace(/\D/g, "")}` : null },
  ];
  return (
    <>
      <PageHero eyebrow="Get in touch" title="Contact Us" intro="We would love to hear from you." />
      <Section>
        <div className="grid gap-12 lg:grid-cols-5">
          <aside className="space-y-4 lg:col-span-2">
            {rows.map(({ Icon, label, value, href }) => (
              <div key={label} className="flex gap-4 rounded-xl border border-line p-5">
                <Icon className="h-5 w-5 shrink-0 text-gold" aria-hidden />
                <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-ivory-muted">{label}</p>
                  {value && href ? <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="mt-1 block text-ivory hover:text-gold">{value}</a> : <AwaitingBadge className="mt-2" label="Awaiting official information" />}</div>
              </div>
            ))}
            <div className="pt-4"><SocialLinks /></div>
          </aside>
          <div className="lg:col-span-3"><h2 className="mb-8 text-4xl">Send a message</h2><ContactForm /></div>
        </div>
      </Section>
    </>
  );
}
