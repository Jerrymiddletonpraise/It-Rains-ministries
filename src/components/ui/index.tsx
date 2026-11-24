import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ComponentProps, ReactNode } from "react";

type Variant = "gold" | "purple" | "outline" | "ghost" | "white" | "danger";
const variants: Record<Variant, string> = {
  gold: "bg-gold-500 text-navy-950 hover:bg-gold-400 shadow-lg shadow-gold-500/20",
  purple: "bg-royal-700 text-white hover:bg-royal-800",
  outline: "border border-gold-500/70 text-gold-500 hover:bg-gold-500/10",
  ghost: "text-royal-800 hover:bg-royal-100",
  white: "bg-white text-navy-900 hover:bg-ivory",
  danger: "bg-red-600 text-white hover:bg-red-700",
};
const base = "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

export function Button({ variant = "gold", className, ...props }: ComponentProps<"button"> & { variant?: Variant }) {
  return <button className={cn(base, variants[variant], className)} {...props} />;
}

export function ButtonLink({ variant = "gold", className, ...props }: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={cn(base, variants[variant], className)} {...props} />;
}

export function Section({ className, children, id }: { className?: string; children: ReactNode; id?: string }) {
  return (
    <section id={id} className={cn("px-4 py-16 sm:px-6 md:py-24", className)}>
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("mb-3 text-xs font-bold uppercase tracking-[0.3em] text-gold-600", className)}>{children}</p>;
}

export function Heading({ eyebrow, title, intro, light, center }: { eyebrow?: string; title: string; intro?: string; light?: boolean; center?: boolean }) {
  return (
    <div className={cn("mb-10 max-w-3xl", center && "mx-auto text-center")}>
      {eyebrow && <Eyebrow className={light ? "text-gold-400" : undefined}>{eyebrow}</Eyebrow>}
      <h2 className={cn("font-serif text-4xl font-bold leading-tight md:text-5xl", light ? "text-white" : "text-navy-900")}>{title}</h2>
      {intro && <p className={cn("mt-4 text-lg", light ? "text-white/75" : "text-navy-800/75")}>{intro}</p>}
    </div>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-2xl border border-navy-900/5 bg-white p-6 shadow-sm", className)}>{children}</div>;
}

export function PageHero({ eyebrow, title, intro, children }: { eyebrow?: string; title: string; intro?: string; children?: ReactNode }) {
  return (
    <div className="bg-heaven relative overflow-hidden px-4 pb-16 pt-36 text-center sm:px-6 md:pb-24 md:pt-44">
      <div className="relative mx-auto max-w-4xl animate-fade-up">
        {eyebrow && <Eyebrow className="text-gold-400">{eyebrow}</Eyebrow>}
        <h1 className="font-serif text-4xl font-bold text-white sm:text-5xl md:text-6xl">{title}</h1>
        {intro && <p className="mx-auto mt-5 max-w-2xl text-lg text-white/75">{intro}</p>}
        {children}
      </div>
    </div>
  );
}

export const inputCls = "w-full rounded-xl border border-navy-900/15 bg-white px-4 py-3 text-navy-900 placeholder:text-navy-900/40 focus:border-royal-500 focus:outline-none focus:ring-2 focus:ring-royal-500/20";

export function Field({ label, name, hint, required, className, ...props }: ComponentProps<"input"> & { label: string; hint?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-sm font-medium text-navy-800">{label}{required && <span className="text-red-600"> *</span>}</span>
      <input name={name} required={required} className={inputCls} {...props} />
      {hint && <span className="mt-1 block text-xs text-navy-800/60">{hint}</span>}
    </label>
  );
}

export function TextArea({ label, name, required, rows = 5, className, ...props }: ComponentProps<"textarea"> & { label: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-sm font-medium text-navy-800">{label}{required && <span className="text-red-600"> *</span>}</span>
      <textarea name={name} required={required} rows={rows} className={inputCls} {...props} />
    </label>
  );
}

export function Select({ label, name, children, className, ...props }: ComponentProps<"select"> & { label: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-sm font-medium text-navy-800">{label}</span>
      <select name={name} className={inputCls} {...props}>{children}</select>
    </label>
  );
}

export function Checkbox({ label, name, className, ...props }: ComponentProps<"input"> & { label: ReactNode }) {
  return (
    <label className={cn("flex items-start gap-3 text-sm text-navy-800", className)}>
      <input type="checkbox" name={name} className="mt-0.5 h-4 w-4 rounded accent-royal-700" {...props} />
      <span>{label}</span>
    </label>
  );
}

/** Invisible field bots fill in. */
export function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>Website<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
    </div>
  );
}

export function Notice({ kind = "info", children }: { kind?: "info" | "success" | "error" | "warn"; children: ReactNode }) {
  const c = { info: "bg-royal-100 text-royal-900", success: "bg-emerald-50 text-emerald-800 border-emerald-200", error: "bg-red-50 text-red-800 border-red-200", warn: "bg-amber-50 text-amber-900 border-amber-200" }[kind];
  return <div role={kind === "error" ? "alert" : "status"} className={cn("rounded-xl border border-transparent px-4 py-3 text-sm", c)}>{children}</div>;
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-navy-900/15 bg-white/60 p-10 text-center">
      <p className="font-serif text-2xl text-navy-900">{title}</p>
      {children && <div className="mt-2 text-navy-800/70">{children}</div>}
    </div>
  );
}
