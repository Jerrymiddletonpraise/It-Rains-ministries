import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Notice } from "@/components/ui/Misc";
import type { Status } from "@/lib/admin";

export function AdminHeader({ title, intro, action }: { title: string; intro?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="eyebrow">GCC Control Center</p><h1 className="mt-3 text-4xl">{title}</h1>{intro && <p className="mt-2 max-w-2xl text-sm text-ivory-muted">{intro}</p>}</div>
      {action}
    </div>
  );
}

export function StatusNotice({ status, className }: { status: Status; className?: string }) {
  return status ? <Notice tone={status.tone} className={cn("mb-6", className)}>{status.msg}</Notice> : null;
}

const PILL: Record<string, string> = {
  live: "border-red-400/50 bg-red-500/15 text-red-200", published: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  scheduled: "border-gold/40 bg-gold/10 text-gold-light", new: "border-gold/40 bg-gold/10 text-gold-light",
  praying: "border-sky-400/40 bg-sky-400/10 text-sky-200", follow_up: "border-amber-400/40 bg-amber-400/10 text-amber-200",
  answered: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200", replied: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
};
export function Pill({ value }: { value: string }) {
  return <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em]", PILL[value] ?? "border-line text-ivory-muted")}>{value.replace(/_/g, " ")}</span>;
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl border border-line bg-charcoal p-5 sm:p-6", className)}>{children}</div>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl border border-dashed border-line p-10 text-center text-sm text-ivory-muted">{children}</p>;
}

export function Tabs<T extends string>({ value, options, onChange }: { value: T; options: { id: T; label: string; count?: number }[]; onChange: (v: T) => void }) {
  return (
    <div className="mb-6 flex flex-wrap gap-2" role="tablist">
      {options.map((o) => (
        <button key={o.id} role="tab" aria-selected={value === o.id} onClick={() => onChange(o.id)}
          className={cn("rounded-full border px-4 py-2 text-sm", value === o.id ? "border-gold bg-gold/10 text-gold-light" : "border-line text-ivory-muted hover:text-ivory")}>
          {o.label}{o.count !== undefined && <span className="ml-2 text-xs opacity-70">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}
