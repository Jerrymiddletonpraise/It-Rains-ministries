import { BookOpen, Fingerprint, Globe2, HandHeart, Heart, Home, LockOpen, Radio, ShieldCheck, Sparkles, Sunrise, type LucideIcon } from "lucide-react";
import { freeWorship, missionPoints, worldMessage, type MissionIcon } from "@/lib/founder";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Misc";
import { cn } from "@/lib/utils";

const ICONS: Record<MissionIcon, LucideIcon> = {
  heart: Heart, sunrise: Sunrise, fingerprint: Fingerprint, sparkles: Sparkles, book: BookOpen,
  home: Home, hand: HandHeart, globe: Globe2, unlock: LockOpen,
};

export function MissionGrid({ limit }: { limit?: number }) {
  const items = limit ? missionPoints.slice(0, limit) : missionPoints;
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(({ icon, title, body }, i) => {
        const Icon = ICONS[icon];
        return (
          <Reveal as="li" key={title} delay={(i % 3) * 100} className="card-luxe p-7">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gold/30 bg-gold/10 text-gold"><Icon className="h-5 w-5" aria-hidden /></span>
            <h3 className="mt-5 text-2xl">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ivory-muted">{body}</p>
          </Reveal>
        );
      })}
    </ul>
  );
}

/** The promise that worship is free: no fees, no paywall, ever. */
export function FreeWorshipBand({ className }: { className?: string }) {
  return (
    <section className={cn("grain relative isolate overflow-hidden border-y border-gold/25 py-20 sm:py-24", className)}>
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_90%_at_15%_50%,hsl(var(--gold)/0.2),transparent_65%),linear-gradient(120deg,hsl(var(--charcoal)),hsl(var(--ink)))]" />
      <div className="container grid items-center gap-10 lg:grid-cols-5">
        <Reveal className="lg:col-span-3">
          <p className="eyebrow mb-4 flex items-center gap-2"><Radio className="h-3.5 w-3.5" aria-hidden />Free online church</p>
          <h2 className="text-4xl leading-[1.05] sm:text-5xl">{freeWorship.headline}</h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ivory-muted">{freeWorship.body}</p>
          <ul className="mt-8 flex flex-wrap gap-2">
            {freeWorship.nos.map((n) => <li key={n} className="rounded-full border border-gold/35 bg-gold/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-gold-light">{n}</li>)}
          </ul>
        </Reveal>
        <Reveal delay={150} className="flex flex-col gap-3 lg:col-span-2 lg:items-end">
          <ButtonLink to="/watch" size="lg" className="w-full sm:w-auto"><Radio className="h-4 w-4" aria-hidden />Watch live, free</ButtonLink>
          <ButtonLink to="/sermons" variant="outline" size="lg" className="w-full sm:w-auto">Free sermon library</ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}

/** Small reassurance used on giving and streaming pages. */
export function FreePromise({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div className={cn("flex gap-4 rounded-2xl border border-gold/30 bg-gold/[0.07] p-6", className)}>
      <ShieldCheck className="mt-0.5 h-7 w-7 shrink-0 text-gold" aria-hidden />
      <div>
        <p className="font-display text-2xl text-ivory">Worship is always free</p>
        <p className="mt-1 text-sm leading-relaxed text-ivory-muted">{children ?? "Every live service, sermon, worship session and teaching is free for everyone, with no membership, subscription, paywall or credit card. Giving is welcome but never required to watch, join or belong."}</p>
      </div>
    </div>
  );
}

/** "Our message to the world": the closing statement of the homepage. */
export function WorldMessage() {
  return (
    <section className="grain relative isolate overflow-hidden py-28 sm:py-40" aria-labelledby="world-message">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_65%_60%_at_50%_105%,hsl(var(--gold)/0.32),transparent_65%),linear-gradient(to_bottom,hsl(var(--ink)),hsl(var(--charcoal)))]" />
      <div aria-hidden className="absolute bottom-0 left-1/2 -z-10 h-[70vh] w-[140vw] -translate-x-1/2 rotate-180 animate-rays bg-[conic-gradient(from_180deg_at_50%_0%,transparent_38%,hsl(var(--gold-light)/0.12)_44%,transparent_47%,hsl(var(--gold-light)/0.09)_50%,transparent_53%,hsl(var(--gold-light)/0.11)_56%,transparent_62%)]" />
      <Reveal className="container max-w-4xl text-center">
        <p className="eyebrow mb-8">Our message to the world</p>
        <h2 id="world-message" className="text-[2.2rem] font-medium uppercase leading-[1.04] tracking-[0.02em] sm:text-6xl"><span className="gold-text">{worldMessage.headline}</span></h2>
        <div className="gold-rule mx-auto mt-10" />
        <div className="mx-auto mt-10 max-w-2xl space-y-6 text-lg leading-relaxed text-ivory-muted sm:text-xl">
          {worldMessage.lines.map((l) => <p key={l}>{l}</p>)}
        </div>
        <p className="mt-14 font-display text-3xl italic leading-snug text-gold-light sm:text-5xl">
          {worldMessage.welcome.map((w) => <span key={w} className="block">{w}</span>)}
        </p>
      </Reveal>
    </section>
  );
}
