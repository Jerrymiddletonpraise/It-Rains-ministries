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
      <AdminHeader title="Live broadcasts" intro="Go live on YouTube, Facebook, Instagram, TikTok and more at once, and show it all on the website." />
      {!enabled.livekit && <div className="mb-6"><Notice>Broadcasts use YouTube Live (free). The website shows the stream with its own chat, prayer requests and viewer count. Streaming straight to the site from a browser or OBS is optional and needs a LiveKit account.</Notice></div>}
      <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
          {streams?.length ? (
            <table className={tableCls}>
              <thead><tr>{["Broadcast", "Status", "Source", "Scheduled / started", "Peak viewers"].map((h) => <th key={h} className={thCls}>{h}</th>)}</tr></thead>
              <tbody>{streams.map((s) => (
                <tr key={s.id}>
                  <td className={tdCls}><Link href={`/admin/live/${s.id}`} className="font-semibold text-royal-800 hover:underline">{s.title}</Link></td>
                  <td className={tdCls}><Badge tone={tone(s.status)}>{s.status}</Badge></td>
                  <td className={tdCls}>{s.source === "rtmp" ? "OBS / RTMP" : s.source === "youtube" ? "YouTube" : s.source === "facebook" ? "Facebook" : "Browser camera"}</td>
                  <td className={tdCls}>{s.started_at ? formatDateTime(s.started_at) : s.scheduled_for ? formatDateTime(s.scheduled_for) : "Not scheduled"}</td>
                  <td className={tdCls}>{s.peak_viewers}</td>
                </tr>
              ))}</tbody>
            </table>
          ) : <div className="p-6"><Empty title="No broadcasts yet">Create one to open the studio.</Empty></div>}
        </div>
        <div className="h-max rounded-2xl bg-white p-6 shadow-sm"><h2 className="mb-4 font-serif text-2xl font-bold">New broadcast</h2><NewStreamForm /></div>
      </div>
      <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="font-serif text-2xl font-bold">Go live on every app at once (free)</h2>
        <div className="mt-4 grid gap-6 text-sm text-navy-800/85 md:grid-cols-3">
          <div>
            <h3 className="font-semibold text-navy-900">1. Automatic YouTube</h3>
            <p className="mt-1">Put your YouTube channel link under Website content → Social media links. Whenever that channel goes live, the Watch Live page plays it automatically within about a minute, even if nobody creates a broadcast here.</p>
          </div>
          <div>
            <h3 className="font-semibold text-navy-900">2. One camera, every platform</h3>
            <p className="mt-1">In free OBS Studio, add the free &ldquo;Multiple RTMP outputs&rdquo; plugin. Paste the server and stream key from YouTube Studio, Facebook Live Producer, Instagram Live Producer (professional accounts) and TikTok LIVE (accounts with LIVE access). One click streams to all of them.</p>
          </div>
          <div>
            <h3 className="font-semibold text-navy-900">3. Link them here</h3>
            <p className="mt-1">Create a broadcast above and paste each app&apos;s live link. Viewers can switch between YouTube and Facebook on the site, and get &ldquo;Watch on&rdquo; buttons for Instagram, TikTok and others. Full steps are in MULTISTREAMING.md.</p>
          </div>
        </div>
      </section>
    </>
  );
}
