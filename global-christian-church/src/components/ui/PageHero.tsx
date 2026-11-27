import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Cinematic page header: deep black, champagne light bloom, film grain. */
export function PageHero({ eyebrow, title, intro, children, image, className }: { eyebrow?: string; title: ReactNode; intro?: ReactNode; children?: ReactNode; image?: string | null; className?: string }) {
  return (
    <header className={cn("grain relative isolate overflow-hidden border-b border-line pb-20 pt-36 sm:pb-28 sm:pt-44", className)}>
      {image && <img src={image} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-30" />}
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,hsl(var(--gold)/0.22),transparent_60%),linear-gradient(to_bottom,hsl(var(--ink)/0.4),hsl(var(--ink)))]" />
      <div aria-hidden className="absolute left-1/2 top-0 -z-10 h-[520px] w-[900px] -translate-x-1/2 animate-rays bg-[conic-gradient(from_180deg_at_50%_0%,transparent_40%,hsl(var(--gold-light)/0.12)_47%,transparent_50%,hsl(var(--gold-light)/0.1)_53%,transparent_60%)]" />
      <div className="container text-center">
        {eyebrow && <p className="eyebrow mb-5 animate-fade-up">{eyebrow}</p>}
        <h1 className="mx-auto max-w-4xl animate-fade-up text-5xl leading-[1.02] [animation-delay:120ms] sm:text-6xl lg:text-7xl">{title}</h1>
        <div className="gold-rule mx-auto mt-8" />
        {intro && <p className="mx-auto mt-8 max-w-2xl animate-fade-up text-base text-ivory-muted [animation-delay:240ms] sm:text-lg">{intro}</p>}
        {children && <div className="mt-10 animate-fade-up [animation-delay:360ms]">{children}</div>}
      </div>
    </header>
  );
}
