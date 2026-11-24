"use client";
import { useEffect, useState } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";

const KEY = "irm-cookie-consent";
type Consent = "all" | "essential" | null;

function read(): Consent {
  try { return (localStorage.getItem(KEY) as Consent) ?? null; } catch { return null; }
}

/** Cookie banner + consent-gated Google Analytics + first-party page view logging. */
export function CookieConsent({ gaId }: { gaId?: string }) {
  const [consent, setConsent] = useState<Consent>("essential");
  const [show, setShow] = useState(false);
  const path = usePathname();

  useEffect(() => {
    const c = read(); setConsent(c); setShow(c === null);
    const open = () => setShow(true);
    window.addEventListener("irm:cookies", open);
    return () => window.removeEventListener("irm:cookies", open);
  }, []);

  // Anonymous first-party page views (no cookies, no personal data) for the admin traffic dashboard.
  useEffect(() => {
    if (path.startsWith("/admin")) return;
    const body = JSON.stringify({ path, referrer: document.referrer || null });
    if (!navigator.sendBeacon?.("/api/analytics", body)) fetch("/api/analytics", { method: "POST", body, keepalive: true }).catch(() => null);
  }, [path]);

  const choose = (c: Exclude<Consent, null>) => {
    try { localStorage.setItem(KEY, c); } catch {}
    setConsent(c); setShow(false);
  };

  return (
    <>
      {gaId && consent === "all" && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="ga" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${gaId}',{anonymize_ip:true});`}</Script>
        </>
      )}
      {show && (
        <div role="dialog" aria-label="Cookie preferences" className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-3xl rounded-2xl bg-navy-900 p-4 text-xs text-white shadow-2xl sm:inset-x-6 sm:p-5 sm:text-sm">
          <p className="font-semibold text-gold-400">Your privacy</p>
          <p className="mt-1 text-white/80">We use essential cookies to keep you signed in and secure. With your permission we also use analytics cookies to understand how people use the site. See our <a className="underline" href="/privacy">Privacy Policy</a>.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={() => choose("all")} className="rounded-full bg-gold-500 px-5 py-2 font-bold text-navy-950">Accept all</button>
            <button onClick={() => choose("essential")} className="rounded-full border border-white/30 px-5 py-2">Essential only</button>
          </div>
        </div>
      )}
    </>
  );
}

export function CookieSettingsLink() {
  return <button onClick={() => window.dispatchEvent(new Event("irm:cookies"))} className="hover:text-gold-400">Cookie Settings</button>;
}
