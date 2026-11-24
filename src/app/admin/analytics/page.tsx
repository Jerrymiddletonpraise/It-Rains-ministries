import { requireArea } from "@/lib/auth";
import { AdminHeader, Stat } from "@/components/admin/ui";
import { Notice } from "@/components/ui";
import { env } from "@/lib/env";

function top<T extends string | null>(list: T[], n = 8) {
  const m = new Map<string, number>();
  list.forEach((v) => m.set(v ?? "(direct / unknown)", (m.get(v ?? "(direct / unknown)") ?? 0) + 1));
  return [...m].sort((a, b) => b[1] - a[1]).slice(0, n);
}

export default async function Analytics({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const { supabase } = await requireArea("analytics");
  const days = Math.min(90, Math.max(1, Number((await searchParams).days ?? 30)));
  const since = new Date(Date.now() - days * 86400_000);
  const { data } = await supabase.from("page_views").select("path,referrer,country,device,created_at").gte("created_at", since.toISOString()).order("created_at").limit(50000);
  const rows = data ?? [];
  const byDay = new Map<string, number>();
  for (let i = 0; i < days; i++) byDay.set(new Date(since.getTime() + (i + 1) * 86400_000).toISOString().slice(0, 10), 0);
  rows.forEach((r) => { const d = r.created_at.slice(0, 10); byDay.set(d, (byDay.get(d) ?? 0) + 1); });
  const series = [...byDay];
  const max = Math.max(1, ...series.map(([, v]) => v));
  const Bars = ({ items, title }: { items: [string, number][]; title: string }) => (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <h3 className="mb-3 font-semibold">{title}</h3>
      {items.length ? items.map(([k, v]) => (
        <div key={k} className="mb-2 text-sm"><div className="flex justify-between"><span className="truncate pr-2">{k}</span><span className="font-semibold">{v}</span></div>
          <div className="mt-1 h-1.5 rounded bg-navy-900/5"><div className="h-1.5 rounded bg-royal-500" style={{ width: `${(v / items[0][1]) * 100}%` }} /></div></div>
      )) : <p className="text-sm text-navy-800/60">No data yet</p>}
    </div>
  );
  return (
    <>
      <AdminHeader title="Website analytics" intro="Privacy-friendly page views (no cookies). Detailed reports are in Google Analytics when enabled."
        action={<div className="flex gap-2">{[7, 30, 90].map((d) => <a key={d} href={`?days=${d}`} className={`rounded-full px-3 py-1.5 text-sm ${d === days ? "bg-royal-700 text-white" : "bg-white"}`}>{d} days</a>)}</div>} />
      {!env.gaId && <div className="mb-6"><Notice>Google Analytics is optional. Add NEXT_PUBLIC_GA_MEASUREMENT_ID to enable it (only loads for visitors who accept analytics cookies).</Notice></div>}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label={`Page views (${days} days)`} value={rows.length.toLocaleString()} />
        <Stat label="Average per day" value={Math.round(rows.length / days).toLocaleString()} />
        <Stat label="Watch Live page views" value={rows.filter((r) => r.path === "/watch").length.toLocaleString()} />
      </div>
      <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
        <h3 className="mb-4 font-semibold">Daily page views</h3>
        <div className="flex h-48 items-end gap-[2px]" role="img" aria-label="Daily page views chart">
          {series.map(([d, v]) => <div key={d} title={`${d}: ${v}`} className="flex-1 rounded-t bg-gradient-to-t from-royal-700 to-royal-500" style={{ height: `${(v / max) * 100}%`, minHeight: v ? 2 : 0 }} />)}
        </div>
        <div className="mt-2 flex justify-between text-xs text-navy-800/50"><span>{series[0]?.[0]}</span><span>{series.at(-1)?.[0]}</span></div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Bars title="Top pages" items={top(rows.map((r) => r.path))} />
        <Bars title="Countries" items={top(rows.map((r) => r.country))} />
        <Bars title="Devices" items={top(rows.map((r) => r.device))} />
        <Bars title="Referrers" items={top(rows.map((r) => r.referrer))} />
      </div>
    </>
  );
}
