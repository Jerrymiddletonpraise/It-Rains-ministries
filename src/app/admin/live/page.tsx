import Link from "next/link";
import { requireArea } from "@/lib/auth";
import { AdminHeader, Badge, tableCls, tdCls, thCls } from "@/components/admin/ui";
import { NewStreamForm } from "@/components/admin/NewStreamForm";
import { Empty, Notice } from "@/components/ui";
import { enabled } from "@/lib/env";
import { formatDateTime } from "@/lib/utils";

export default async function LiveAdmin() {
  const { supabase } = await requireArea("live");
  const { data: streams } = await supabase.from("streams").select("*").order("created_at", { ascending: false }).limit(50);
  const tone = (s: string) => (s === "live" ? "red" : s === "paused" ? "gold" : s === "ended" ? "gray" : "purple") as "red" | "gold" | "gray" | "purple";
  return (
    <>
      <AdminHeader title="Live broadcasts" intro="Go live from a phone or laptop browser, OBS / RTMP encoders, or YouTube Live." />
      {!enabled.livekit && <div className="mb-6"><Notice kind="warn">LiveKit is not configured yet. Browser and OBS streaming need LIVEKIT_API_KEY, LIVEKIT_API_SECRET and NEXT_PUBLIC_LIVEKIT_URL. YouTube embeds work now.</Notice></div>}
      <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
          {streams?.length ? (
            <table className={tableCls}>
              <thead><tr>{["Broadcast", "Status", "Source", "Scheduled / started", "Peak viewers"].map((h) => <th key={h} className={thCls}>{h}</th>)}</tr></thead>
              <tbody>{streams.map((s) => (
                <tr key={s.id}>
                  <td className={tdCls}><Link href={`/admin/live/${s.id}`} className="font-semibold text-royal-800 hover:underline">{s.title}</Link></td>
                  <td className={tdCls}><Badge tone={tone(s.status)}>{s.status}</Badge></td>
                  <td className={tdCls}>{s.source === "rtmp" ? "OBS / RTMP" : s.source === "youtube" ? "YouTube" : "Browser camera"}</td>
                  <td className={tdCls}>{s.started_at ? formatDateTime(s.started_at) : s.scheduled_for ? formatDateTime(s.scheduled_for) : "Not scheduled"}</td>
                  <td className={tdCls}>{s.peak_viewers}</td>
                </tr>
              ))}</tbody>
            </table>
          ) : <div className="p-6"><Empty title="No broadcasts yet">Create one to open the studio.</Empty></div>}
        </div>
        <div className="h-max rounded-2xl bg-white p-6 shadow-sm"><h2 className="mb-4 font-serif text-2xl font-bold">New broadcast</h2><NewStreamForm /></div>
      </div>
    </>
  );
}
