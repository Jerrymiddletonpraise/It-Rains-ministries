import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { getSetting } from "@/lib/data";
import { LogoMark, Wordmark } from "@/components/ui/Logo";
import { SocialLinks } from "@/components/ui/SocialIcons";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { CookieSettingsLink } from "./CookieConsent";
import { FooterGate } from "./FooterGate";

const LINKS = [
  ["About Us", "/about"], ["Meet Our Pastor", "/pastor"], ["Watch Live", "/watch"], ["Sermons & Media", "/sermons"],
  ["Ministries", "/ministries"], ["Events", "/events"], ["Prayer Request", "/prayer"], ["Testimonies", "/testimonies"],
  ["Online Giving", "/give"], ["Bible Study", "/bible-study"], ["Contact", "/contact"], ["FAQ", "/faq"],
];

export async function Footer() {
  const [contact, social, services] = await Promise.all([getSetting("contact"), getSetting("social"), getSetting("services")]);
  return (
    <FooterGate>
      <footer className="bg-navy-950 text-white/75">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <LogoMark className="h-16 w-16" />
              <Wordmark />
            </div>
            <p className="mt-5 text-sm leading-relaxed">A global family of worshippers carrying the presence of God to the nations. Where Heaven&apos;s Abundance Rains Upon Lives.</p>
            <SocialLinks social={social} className="mt-6 flex gap-3" />
          </div>
          <div>
            <h3 className="mb-4 font-serif text-xl text-white">Quick Links</h3>
            <ul className="grid grid-cols-2 gap-2 text-sm">
              {LINKS.map(([l, h]) => <li key={h}><Link href={h} className="hover:text-gold-400">{l}</Link></li>)}
            </ul>
          </div>
          <div>
            <h3 className="mb-4 font-serif text-xl text-white">Service Times</h3>
            <ul className="space-y-3 text-sm">
              {services.map((s) => (
                <li key={s.name}><span className="block font-semibold text-gold-400">{s.day}, {s.time}</span>{s.name}{s.online && " · Online"}</li>
              ))}
            </ul>
            <h3 className="mb-3 mt-8 font-serif text-xl text-white">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2"><MapPin className="h-4 w-4 shrink-0 text-gold-500" />{contact.address}</li>
              <li className="flex gap-2"><Phone className="h-4 w-4 shrink-0 text-gold-500" /><a href={`tel:${contact.phone}`}>{contact.phone}</a></li>
              <li className="flex gap-2"><Mail className="h-4 w-4 shrink-0 text-gold-500" /><a href={`mailto:${contact.email}`}>{contact.email}</a></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 font-serif text-xl text-white">Stay Connected</h3>
            <p className="mb-4 text-sm">Receive service updates, events and words of encouragement.</p>
            <NewsletterForm dark />
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p>© {new Date().getFullYear()} IT RAINS MINISTRIES. All rights reserved.</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/privacy" className="hover:text-gold-400">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-gold-400">Terms & Conditions</Link>
              <CookieSettingsLink />
            </div>
          </div>
        </div>
      </footer>
    </FooterGate>
  );
}
