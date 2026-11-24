import Link from "next/link";
import { notFound } from "next/navigation";
import { requireArea } from "@/lib/auth";
import { can } from "@/lib/roles";
import { enabled } from "@/lib/env";
import { AdminHeader, Badge } from "@/components/admin/ui";
import { Studio } from "@/components/admin/Studio";
import { RtmpPanel } from "@/components/admin/RtmpPanel";
import { LiveChat } from "@/components/live/LiveChat";
import { updateStreamSettings, deleteStream } from "@/app/actions/live";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Notice, inputCls } from "@/components/ui";
import { toEmbedUrl } from "@/lib/utils";

export default async function StudioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, roles } = await requireArea("live");
  const [{ data: s }, { data: secret }] = await Promise.all([
    supabase.from("streams").select("*").eq("id", id).maybeSingle(),
    supabase.from("stream_secrets").select("*").eq("stream_id", id).maybeSingle(),
  ]);
  if (!s) notFound();
  const save = updateStreamSettings.bind(null, id);
  return (
    <>
      <Link href="/admin/live" className="text-sm font-semibold text-royal-700">← All broadcasts</Link>
      <AdminHeader title={s.title} intro={s.source === "rtmp" ? "OBS / RTMP broadcast" : s.source === "youtube" ? "YouTube Live embed" : "Browser camera broadcast"}
        action={<div className="flex items-center gap-3"><Badge tone={s.status === "live" ? "red" : s.status === "paused" ? "gold" : "purple"}>{s.status}</Badge><a href="/watch" target="_blank" className="text-sm font-semibold text-royal-700">Open public page ↗</a></div>} />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {s.source === "browser" && (enabled.livekit ? <Studio streamId={id} status={s.status} /> : <Notice kind="warn">Add the LiveKit credentials to stream from this browser.</Notice>)}
          {s.source === "rtmp" && <RtmpPanel streamId={id} status={s.status} rtmpUrl={secret?.rtmp_url ?? null} streamKey={secret?.stream_key ?? null} livekit={enabled.livekit} />}
          {s.source === "youtube" && (
            <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
              {toEmbedUrl(s.youtube_url) ? <div className="relative aspect-video overflow-hidden rounded-xl"><iframe src={toEmbedUrl(s.youtube_url)!} className="absolute inset-0 h-full w-full" title="Preview" allowFullScreen /></div> : <Notice kind="warn">Add a valid YouTube URL below.</Notice>}
              <RtmpPanel streamId={id} status={s.status} rtmpUrl={null} streamKey={null} livekit={false} youtube />
            </div>
          )}
          <form action={save} className="grid gap-4 rounded-2xl bg-white p-6 shadow-sm md:grid-cols-2">
            <h2 className="font-serif text-2xl font-bold md:col-span-2">Broadcast settings</h2>
            <label className="text-sm font-medium md:col-span-2">Title<input name="title" defaultValue={s.title} className={inputCls} /></label>
            <label className="text-sm font-medium md:col-span-2">Description<textarea name="description" rows={2} defaultValue={s.description} className={inputCls} /></label>
            <label className="text-sm font-medium md:col-span-2">YouTube URL (for YouTube broadcasts)<input name="youtube_url" defaultValue={s.youtube_url ?? ""} className={inputCls} /></label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="chat_enabled" defaultChecked={s.chat_enabled} className="accent-royal-700" />Live chat enabled</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="record" defaultChecked={s.record} className="accent-royal-700" />Record broadcast</label>
            <button className="rounded-full bg-royal-700 px-6 py-2.5 text-sm font-semibold text-white md:col-span-2 md:w-max">Save settings</button>
          </form>
          {s.recording_url && <Notice kind="success">Recording saved. Find the replay under Sermons &amp; media (category &ldquo;Live Service Replays&rdquo;).</Notice>}
          {s.status !== "live" && (
            <form action={deleteStream}><input type="hidden" name="id" value={id} /><ConfirmButton message="Delete this broadcast and its chat?">Delete broadcast</ConfirmButton></form>
          )}
        </div>
        <div className="xl:sticky xl:top-6 xl:h-[calc(100vh-3rem)]">
          <LiveChat streamId={id} signedIn isModerator={can(roles, "moderation")} chatEnabled={s.chat_enabled} />
        </div>
      </div>
    </>
  );
}
