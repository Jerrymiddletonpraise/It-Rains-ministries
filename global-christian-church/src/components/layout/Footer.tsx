import { Link } from "react-router-dom";
import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone, Twitch, Youtube } from "lucide-react";
import { footerLegal, navGroups } from "@/lib/nav";
import { useSettings } from "@/lib/data";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { Logo } from "./Logo";

function TikTokIcon(props: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}><path d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.2v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.6a5.8 5.8 0 1 0 5 5.8V9a7.5 7.5 0 0 0 4.4 1.4V7.2a4.3 4.3 0 0 1-3.3-1.4Z" /></svg>;
}

export function SocialLinks({ className = "" }: { className?: string }) {
  const { settings: { social } } = useSettings();
  const links = [
    { href: social.youtube, label: "YouTube", Icon: Youtube },
    { href: social.facebook, label: "Facebook", Icon: Facebook },
    { href: social.instagram, label: "Instagram", Icon: Instagram },
    { href: social.tiktok, label: "TikTok", Icon: TikTokIcon },
    { href: social.twitch, label: "Twitch", Icon: Twitch },
  ].filter((l) => l.href);
  if (!links.length) return <p className={`text-xs text-ivory-muted/70 ${className}`}>Social media links will appear here once the church adds them in the Control Center.</p>;
  return (
    <ul className={`flex flex-wrap gap-3 ${className}`}>
      {links.map(({ href, label, Icon }) => (
        <li key={label}><a href={href!} target="_blank" rel="noopener noreferrer" aria-label={`Global Christian Church on ${label}`} className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ivory-muted transition hover:border-gold hover:text-gold"><Icon className="h-4 w-4" /></a></li>
      ))}
    </ul>
  );
}

export function Footer() {
  const { settings: { church_profile: p } } = useSettings();
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line bg-ink-soft">
      <div className="container grid gap-12 py-20 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Logo />
          <p className="mt-6 font-display text-2xl italic text-gold-light">{p.tagline}</p>
          <ul className="mt-6 space-y-3 text-sm text-ivory-muted">
            <li className="flex gap-3"><MapPin className="h-4 w-4 shrink-0 text-gold" aria-hidden />{p.address ?? "Church address awaiting official information"}</li>
            {p.phone && <li className="flex gap-3"><Phone className="h-4 w-4 shrink-0 text-gold" aria-hidden /><a href={`tel:${p.phone}`}>{p.phone}</a></li>}
            {p.email && <li className="flex gap-3"><Mail className="h-4 w-4 shrink-0 text-gold" aria-hidden /><a href={`mailto:${p.email}`}>{p.email}</a></li>}
            {p.whatsapp && <li className="flex gap-3"><MessageCircle className="h-4 w-4 shrink-0 text-gold" aria-hidden /><a href={`https://wa.me/${p.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">WhatsApp</a></li>}
          </ul>
          <SocialLinks className="mt-6" />
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-5">
          {navGroups.map((g) => (
            <div key={g.label}>
              <p className="eyebrow mb-4">{g.label}</p>
              <ul className="space-y-2.5 text-sm">{g.items.map((i) => <li key={i.to}><Link to={i.to} className="text-ivory-muted transition hover:text-ivory">{i.label}</Link></li>)}</ul>
            </div>
          ))}
        </div>
        <div className="lg:col-span-3">
          <p className="eyebrow mb-4">Stay connected</p>
          <p className="mb-4 text-sm text-ivory-muted">Receive news, events and encouragement from Global Christian Church.</p>
          <NewsletterForm compact />
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container flex flex-col items-center justify-between gap-4 py-6 text-xs text-ivory-muted sm:flex-row">
          <p>© {year} Global Christian Church. All rights reserved.</p>
          <ul className="flex gap-6">{footerLegal.map((l) => <li key={l.to}><Link to={l.to} className="hover:text-ivory">{l.label}</Link></li>)}<li><Link to="/login" className="hover:text-ivory">Member Sign In</Link></li></ul>
        </div>
      </div>
    </footer>
  );
}
