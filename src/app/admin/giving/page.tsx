import Link from "next/link";
import { Download } from "lucide-react";
import { requireArea } from "@/lib/auth";
import { AdminHeader, Badge, Stat, tableCls, tdCls, thCls } from "@/components/admin/ui";
import { Empty, Notice } from "@/components/ui";
import { enabled } from "@/lib/env";
import { formatDate, formatMoney, FUNDS } from "@/lib/utils";

export default async function GivingAdmin({ searchParams }: { searchParams: Promise<{ fund?: string; from?: string; to?: string }> }) {
  const { supabase } = await requireArea("giving");
  const sp = await searchParams;
  const from = sp.from || new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10);
  const to = sp.to || new Date().toISOString().slice(0, 10);
  let q = supabase.from("donations").select("*").gte("created_at", from).lte("created_at", `${to}T23:59:59Z`).order("created_at", { ascending: false }).limit(1000);
  if (sp.fund && sp.fund in FUNDS) q = q.eq("fund", sp.fund);
  const [{ data: gifts }, { data: recurring }] = await Promise.all([q, supabase.from("recurring_gifts").select("*").eq("status", "active")]);
  const ok = (gifts ?? []).filter((g) => g.status === "succeeded");
  const sum = (list: typeof ok) => Object.entries(list.reduce<Record<string, number>>((a, g) => ({ ...a, [g.currency]: (a[g.currency] ?? 0) + g.amount_cents }), {})).map(([c, v]) => formatMoney(v, c)).join(" · ") || formatMoney(0);
  return (
    <>
      <AdminHeader title="Giving" intro="Every record below was confirmed by Stripe or PayPal. Card details are never stored."
        action={<a href="/api/admin/export?type=donations" className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white"><Download className="h-4 w-4" />Export CSV</a>} />
      {!enabled.stripe && !enabled.paypal && <div className="mb-6"><Notice kind="warn">No payment provider is connected yet.</Notice></div>}
      <form className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl bg-white p-4 shadow-sm">
        <label className="text-sm">From<input type="date" name="from" defaultValue={from} className="block rounded-lg border px-3 py-2" /></label>
        <label className="text-sm">To<input type="date" name="to" defaultValue={to} className="block rounded-lg border px-3 py-2" /></label>
        <label className="text-sm">Fund<select name="fund" defaultValue={sp.fund ?? ""} className="block rounded-lg border px-3 py-2"><option value="">All funds</option>{Object.entries(FUNDS).map(([k, f]) => <option key={k} value={k}>{f.label}</option>)}</select></label>
        <button className="rounded-full bg-royal-700 px-5 py-2 text-sm font-semibold text-white">Apply</button>
      </form>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total received" value={sum(ok)} tone="gold" />
        <Stat label="Number of gifts" value={ok.length} />
        <Stat label="Active monthly partners" value={recurring?.length ?? 0} />
        <Stat label="Refunded" value={(gifts ?? []).filter((g) => g.status === "refunded").length} />
      </div>
      <div className="mb-6 grid gap-3 sm:grid-cols-5">
        {Object.entries(FUNDS).map(([k, f]) => <div key={k} className="rounded-xl bg-white p-4 shadow-sm"><p className="text-xs text-navy-800/60">{f.label}</p><p className="font-semibold">{sum(ok.filter((g) => g.fund === k))}</p></div>)}
      </div>
      {gifts?.length ? (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className={tableCls}>
            <thead><tr>{["Date", "Donor", "Fund", "Amount", "Type", "Method", "Status", "Receipt"].map((h) => <th key={h} className={thCls}>{h}</th>)}</tr></thead>
            <tbody>{gifts.map((g) => (
              <tr key={g.id}>
                <td className={tdCls}>{formatDate(g.created_at)}</td>
                <td className={tdCls}>{g.donor_name || "Anonymous"}<br /><span className="text-xs text-navy-800/60">{g.donor_email}</span></td>
                <td className={tdCls}>{FUNDS[g.fund]?.label}</td><td className={`${tdCls} font-semibold`}>{formatMoney(g.amount_cents, g.currency)}</td>
                <td className={tdCls}>{g.frequency === "monthly" ? "Monthly" : "One-time"}</td><td className={`${tdCls} capitalize`}>{g.provider}</td>
                <td className={tdCls}><Badge tone={g.status === "succeeded" ? "green" : "red"}>{g.status}</Badge></td>
                <td className={tdCls}><Link href={`/give/receipt/${g.id}`} className="text-royal-700">{g.receipt_number}</Link></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      ) : <Empty title="No gifts in this period" />}
    </>
  );
}
