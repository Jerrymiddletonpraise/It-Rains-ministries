import { requireArea } from "@/lib/auth";
import { AdminHeader, Badge } from "@/components/admin/ui";
import { PrayerResponseForm } from "@/components/admin/PrayerResponseForm";
import { Empty } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

const KINDS = ["all", "prayer", "urgent", "counseling", "followup"];
const STATUSES = ["open", "new", "praying", "responded", "closed", "all"];

export default async function PrayerAdmin({ searchParams }: { searchParams: Promise<{ kind?: string; status?: string }> }) {
  const { supabase } = await requireArea("prayer");
  const { kind = "all", status = "open" } = await searchParams;
  let q = supabase.from("prayer_requests").select("*").order("created_at", { ascending: false }).limit(200);
  if (kind !== "all") q = q.eq("kind", kind);
  if (status === "open") q = q.in("status", ["new", "praying"]); else if (status !== "all") q = q.eq("status", status);
  const { data } = await q;
  const link = (k: string, s: string) => `/admin/prayer?kind=${k}&status=${s}`;
  return (
    <>
      <AdminHeader title="Prayer requests" intro="Private. Visible only to pastors, moderators and super admins." />
      <div className="mb-3 flex flex-wrap gap-2">{KINDS.map((k) => <a key={k} href={link(k, status)} className={`rounded-full px-3 py-1.5 text-sm capitalize ${k === kind ? "bg-royal-700 text-white" : "bg-white"}`}>{k}</a>)}</div>
      <div className="mb-6 flex flex-wrap gap-2">{STATUSES.map((s) => <a key={s} href={link(kind, s)} className={`rounded-full px-3 py-1.5 text-sm capitalize ${s === status ? "bg-navy-900 text-white" : "bg-white"}`}>{s}</a>)}</div>
      {data?.length ? <div className="space-y-4">{data.map((r) => (
        <div key={r.id} className={`rounded-2xl bg-white p-5 shadow-sm ${r.kind === "urgent" ? "ring-2 ring-red-400" : ""}`}>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <strong>{r.name}</strong>
            <Badge tone={r.kind === "urgent" ? "red" : r.kind === "counseling" ? "purple" : "gray"}>{r.kind}</Badge>
            <Badge tone={r.status === "new" ? "gold" : r.status === "responded" ? "green" : "gray"}>{r.status}</Badge>
            {r.source === "live" && <Badge tone="purple">During live</Badge>}
            {r.wants_followup && <Badge tone="gold">Wants follow-up</Badge>}
            <span className="text-navy-800/50">{formatDateTime(r.created_at)}</span>
          </div>
          <p className="mt-1 text-sm text-navy-800/70">{[r.email, r.phone, r.country].filter(Boolean).join(" · ")}</p>
          <p className="mt-3 whitespace-pre-line">{r.request}</p>
          <PrayerResponseForm row={{ id: r.id, status: r.status, response: r.response, internal_notes: r.internal_notes, hasEmail: Boolean(r.email) }} />
        </div>
      ))}</div> : <Empty title="No requests in this view" />}
    </>
  );
}
