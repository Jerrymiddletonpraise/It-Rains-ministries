// Lightweight brand marks (simplified shapes) for social links.
type P = { className?: string };
const s = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export const FacebookIcon = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true"><path fill="currentColor" d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21h3z" /></svg>
);
export const YoutubeIcon = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="4" {...s} /><path fill="currentColor" d="M10 9l5 3-5 3z" /></svg>
);
export const InstagramIcon = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" {...s} /><circle cx="12" cy="12" r="4" {...s} /><circle cx="17.3" cy="6.7" r="1" fill="currentColor" /></svg>
);
export const TiktokIcon = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true"><path {...s} d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5M14 3c.5 2.6 2.3 4.3 5 4.5" /></svg>
);
export const XIcon = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true"><path {...s} d="M4 4l16 16M20 4L4 20" /></svg>
);
export const WhatsappIcon = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true"><path {...s} d="M4 20l1.3-3.9A8 8 0 1 1 8.2 19z" /><path fill="currentColor" d="M9.2 8.3c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.7 1.6c.1.3 0 .5-.1.6l-.5.6c-.1.2-.1.3 0 .5.5.9 1.3 1.7 2.3 2.2.2.1.4.1.5-.1l.6-.7c.2-.2.4-.2.6-.1l1.6.8c.3.1.4.3.3.6-.1.9-.9 1.6-1.8 1.7-1 .1-2.5-.3-4.2-1.8-1.7-1.6-2.4-3.2-2.4-4.2 0-.6.3-1.2.7-1.7z" /></svg>
);

import type { SocialSettings } from "@/lib/defaults";
export function SocialLinks({ social, className = "flex gap-3" }: { social: SocialSettings; className?: string }) {
  const items = [
    { href: social.facebook, label: "Facebook", Icon: FacebookIcon },
    { href: social.youtube, label: "YouTube", Icon: YoutubeIcon },
    { href: social.instagram, label: "Instagram", Icon: InstagramIcon },
    { href: social.tiktok, label: "TikTok", Icon: TiktokIcon },
    { href: social.x, label: "X", Icon: XIcon },
  ].filter((i) => i.href);
  if (!items.length) return null;
  return (
    <div className={className}>
      {items.map(({ href, label, Icon }) => (
        <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-gold-500/40 text-gold-400 transition hover:bg-gold-500 hover:text-navy-950">
          <Icon />
        </a>
      ))}
    </div>
  );
}
