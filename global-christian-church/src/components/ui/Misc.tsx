import { useEffect, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, FlaskConical, PlugZap } from "lucide-react";
import { cn } from "@/lib/utils";

export function DemoBadge({ className, label = "Demo content" }: { className?: string; label?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-gold-light", className)}>
      <FlaskConical className="h-3 w-3" aria-hidden /> {label}
    </span>
  );
}

export function AwaitingBadge({ label = "Awaiting configuration", className }: { label?: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-amber-200", className)}>
      <PlugZap className="h-3 w-3" aria-hidden /> {label}
    </span>
  );
}

export function Notice({ tone = "info", title, children, className }: { tone?: "info" | "warn" | "success" | "error"; title?: string; children: ReactNode; className?: string }) {
  const Icon = tone === "success" ? CheckCircle2 : tone === "info" ? PlugZap : AlertTriangle;
  const tones = {
    info: "border-gold/30 bg-gold/5 text-ivory-muted",
    warn: "border-amber-400/30 bg-amber-400/5 text-amber-100",
    success: "border-emerald-400/30 bg-emerald-400/5 text-emerald-100",
    error: "border-red-400/30 bg-red-400/5 text-red-100",
  };
  return (
    <div role={tone === "error" ? "alert" : "status"} className={cn("flex gap-3 rounded-xl border p-4 text-sm", tones[tone], className)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div>{title && <p className="mb-1 font-semibold text-ivory">{title}</p>}{children}</div>
    </div>
  );
}

/** Fades content up the first time it scrolls into view. Honours reduced-motion via CSS. */
export function Reveal({ children, className, delay = 0, as: Tag = "div" }: { children: ReactNode; className?: string; delay?: number; as?: "div" | "section" | "li" | "article" }) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (!("IntersectionObserver" in window)) { setVisible(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } }, { rootMargin: "0px 0px -10% 0px" });
    io.observe(el); return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref as never} style={{ animationDelay: `${delay}ms` }} className={cn(visible ? "animate-fade-up" : "opacity-0", className)}>
      {children}
    </Tag>
  );
}

export function SectionHeading({ eyebrow, title, intro, align = "center", className }: { eyebrow?: string; title: ReactNode; intro?: ReactNode; align?: "center" | "left"; className?: string }) {
  return (
    <div className={cn("mb-12 max-w-3xl", align === "center" ? "mx-auto text-center" : "", className)}>
      {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
      <h2 className="text-4xl leading-[1.05] sm:text-5xl">{title}</h2>
      <div className={cn("gold-rule mt-6", align === "center" && "mx-auto")} />
      {intro && <p className="mt-6 text-base leading-relaxed text-ivory-muted sm:text-lg">{intro}</p>}
    </div>
  );
}

export function Section({ children, className, id, tone = "ink" }: { children: ReactNode; className?: string; id?: string; tone?: "ink" | "charcoal" }) {
  return <section id={id} className={cn("py-20 sm:py-28", tone === "charcoal" && "bg-charcoal", className)}><div className="container">{children}</div></section>;
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-line p-10 text-center"><p className="font-display text-2xl text-ivory">{title}</p>{children && <div className="mt-2 text-sm text-ivory-muted">{children}</div>}</div>;
}

export function Spinner({ label = "Loading" }: { label?: string }) {
  return <div role="status" className="flex items-center justify-center py-16"><span className="h-8 w-8 animate-spin rounded-full border-2 border-gold/20 border-t-gold" /><span className="sr-only">{label}</span></div>;
}
