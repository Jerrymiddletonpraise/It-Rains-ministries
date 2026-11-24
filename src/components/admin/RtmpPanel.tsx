"use client";
import { useState, useTransition } from "react";
import { Copy, Radio, Square, KeyRound, Eye, EyeOff } from "lucide-react";
import { createIngressForStream, setStreamStatus } from "@/app/actions/live";
import { useViewerCount } from "@/components/live/usePresence";
import { Notice } from "@/components/ui";

export function RtmpPanel({ streamId, status, rtmpUrl, streamKey, livekit, youtube }: { streamId: string; status: string; rtmpUrl: string | null; streamKey: string | null; livekit: boolean; youtube?: boolean }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const viewers = useViewerCount(streamId, false);
  const run = (fn: () => Promise<{ error?: string; recording?: string | null } | { ok: boolean; recording?: string | null }>) => start(async () => {
    const r = await fn();
    setMsg("error" in r && r.error ? r.error : ("recording" in r && r.recording) || "Done.");
  });
  const copy = (v: string) => navigator.clipboard.writeText(v);

  return (
    <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between"><h2 className="font-serif text-2xl font-bold">{youtube ? "Broadcast controls" : "OBS / encoder setup"}</h2><span className="flex items-center gap-1 text-sm text-navy-800/70"><Eye className="h-4 w-4" />{viewers} watching on site</span></div>
      {!youtube && (!livekit ? <Notice kind="warn">Add the LiveKit credentials to create an RTMP endpoint.</Notice> : rtmpUrl && streamKey ? (
        <div className="space-y-3">
          {[["Server (RTMP URL)", rtmpUrl, false], ["Stream key", streamKey, true]].map(([l, v, secret]) => (
            <div key={String(l)}>
              <p className="text-sm font-medium">{l}</p>
              <div className="mt-1 flex gap-2">
                <code className="min-w-0 flex-1 truncate rounded-lg bg-navy-900/5 px-3 py-2 text-sm">{secret && !show ? "•".repeat(24) : String(v)}</code>
                {secret && <button onClick={() => setShow(!show)} className="rounded-lg px-3 ring-1 ring-navy-900/10" aria-label="Show key">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>}
                <button onClick={() => copy(String(v))} className="rounded-lg px-3 ring-1 ring-navy-900/10" aria-label="Copy"><Copy className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
          <ol className="list-decimal space-y-1 pl-5 text-sm text-navy-800/80">
            <li>In OBS open Settings → Stream, choose Service: <strong>Custom</strong>.</li>
            <li>Paste the Server and Stream key above. Keep the key private.</li>
            <li>Recommended output: 1080p or 720p, 30 fps, 4500 to 6000 Kbps video, keyframe interval 2s, AAC 160 Kbps audio.</li>
            <li>Click <strong>Start Streaming</strong> in OBS. This page and the website go live automatically and recording begins.</li>
          </ol>
        </div>
      ) : (
        <button disabled={pending} onClick={() => run(() => createIngressForStream(streamId))} className="flex items-center gap-2 rounded-full bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white"><KeyRound className="h-4 w-4" />Generate secure RTMP stream key</button>
      ))}
      <div className="flex flex-wrap gap-2 border-t border-navy-900/10 pt-4">
        {status !== "live" && status !== "ended" && <button disabled={pending} onClick={() => run(() => setStreamStatus(streamId, "live"))} className="flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 font-bold text-white"><Radio className="h-4 w-4" />Mark as live</button>}
        {status === "live" && <button disabled={pending} onClick={() => run(() => setStreamStatus(streamId, "paused"))} className="rounded-full bg-gold-500 px-5 py-2.5 font-bold">Pause</button>}
        {status !== "ended" && <button disabled={pending} onClick={() => run(() => setStreamStatus(streamId, "ended"))} className="flex items-center gap-2 rounded-full bg-navy-900 px-5 py-2.5 font-bold text-white"><Square className="h-4 w-4" />End broadcast</button>}
      </div>
      {msg && <Notice>{msg}</Notice>}
    </div>
  );
}
