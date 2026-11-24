import Link from "next/link";
import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { requireArea } from "@/lib/auth";
import { setRegistrationStatus } from "@/app/actions/admin";
import { AdminHeader, Badge, Stat, tableCls, tdCls, thCls } from "@/components/admin/ui";
import { Empty } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

export default async function Registrations({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireArea("events");
  const [{ data: e }, { data: regs }] = await Promise.all([
    supabase.from("events").select("title,capacity,starts_at,timezone").eq("id", id).maybeSingle(),
    supabase.from("event_registrations").select("*").eq("event_id", id).order("created_at"),
  ]);
  if (!e) notFound();
  const confirmed = (regs ?? []).filter((r) => r.status === "confirmed");
  const seats = confirmed.reduce((a, r) => a + 1 + r.guests, 0);
  return (
    <>
      <Link href="/admin/events" className="text-sm font-semibold text-royal-700">← Events</Link>
      <AdminHeader title={`Registrations: ${e.title}`} intro={formatDateTime(e.starts_at, e.timezone)}
        action={<a href={`/api/admin/export?type=registrations&event=${id}`} className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white"><Download className="h-4 w-4" />Export CSV</a>} />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Confirmed registrations" value={confirmed.length} />
        <Stat label="Seats taken (incl. guests)" value={seats} />
        <Stat label="Capacity" value={e.capacity ?? "Unlimited"} />
      </div>
      {regs?.length ? (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className={tableCls}>
            <thead><tr>{["Name", "Email", "Phone", "Guests", "Notes", "Registered", "Status", ""].map((h) => <th key={h} className={thCls}>{h}</th>)}</tr></thead>
            <tbody>{regs.map((r) => (
              <tr key={r.id}>
                <td className={tdCls}>{r.name}</td><td className={tdCls}>{r.email}</td><td className={tdCls}>{r.phone}</td><td className={tdCls}>{r.guests}</td>
                <td className={tdCls}>{r.notes}</td><td className={tdCls}>{formatDateTime(r.created_at)}</td>
                <td className={tdCls}><Badge tone={r.status === "confirmed" ? "green" : "gray"}>{r.status}</Badge></td>
                <td className={tdCls}><form action={setRegistrationStatus}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="event_id" value={id} /><input type="hidden" name="status" value={r.status === "confirmed" ? "cancelled" : "confirmed"} /><button className="text-sm text-royal-700">{r.status === "confirmed" ? "Cancel" : "Confirm"}</button></form></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      ) : <Empty title="No registrations yet" />}
    </>
  );
}
