import type { ReactNode } from "react";
import Link from "next/link";
export function AdminHeader({ title, intro, action }: { title: string; intro?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><h1 className="font-serif text-4xl font-bold text-navy-900">{title}</h1>{intro && <p className="mt-1 text-navy-800/70">{intro}</p>}</div>
      {action}
    </div>
  );
}
export function Stat({ label, value, href, tone = "royal" }: { label: string; value: ReactNode; href?: string; tone?: "royal" | "gold" | "red" }) {
  const c = { royal: "text-royal-800", gold: "text-gold-600", red: "text-red-600" }[tone];
  const inner = <div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-navy-800/60">{label}</p><p className={`mt-1 font-serif text-3xl font-bold ${c}`}>{value}</p></div>;
  return href ? <Link href={href} className="block transition hover:-translate-y-0.5">{inner}</Link> : inner;
}
export function Badge({ children, tone = "gray" }: { children: ReactNode; tone?: "gray" | "green" | "red" | "gold" | "purple" }) {
  const c = { gray: "bg-navy-900/5 text-navy-800", green: "bg-emerald-100 text-emerald-800", red: "bg-red-100 text-red-800", gold: "bg-gold-200 text-navy-900", purple: "bg-royal-100 text-royal-800" }[tone];
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${c}`}>{children}</span>;
}
export const tableCls = "w-full min-w-[720px] text-left text-sm";
export const thCls = "px-4 py-3 font-medium text-navy-800/60";
export const tdCls = "px-4 py-3 border-t border-navy-900/5 align-top";
