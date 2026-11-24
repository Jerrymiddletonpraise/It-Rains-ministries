"use client";
import { useEffect, useRef, useState } from "react";
import { Room, createLocalTracks, LocalVideoTrack, LocalAudioTrack, Track, VideoPresets, type LocalTrack } from "livekit-client";
import { Video, VideoOff, Mic, MicOff, Radio, Pause, Play, Square, SwitchCamera, Eye, MonitorUp } from "lucide-react";
import { getPublisherCredentials, setStreamStatus } from "@/app/actions/live";
import { useViewerCount } from "@/components/live/usePresence";
import { Notice } from "@/components/ui";
import { cn } from "@/lib/utils";

const RES = { "720p": VideoPresets.h720, "1080p": VideoPresets.h1080, "540p (low bandwidth)": VideoPresets.h540 } as const;
type ResKey = keyof typeof RES;

/** In-browser broadcaster: works on Android/iPhone browsers, Windows/Mac laptops and desktops. */
export function Studio({ streamId, status: initial }: { streamId: string; status: string }) {
  const viewers = useViewerCount(streamId, false);
  const preview = useRef<HTMLVideoElement>(null);
  const roomRef = useRef<Room | null>(null);
  const tracksRef = useRef<LocalTrack[]>([]);
  const [status, setStatus] = useState(initial);
  const [cams, setCams] = useState<MediaDeviceInfo[]>([]);
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  const [cam, setCam] = useState("");
  const [mic, setMic] = useState("");
  const [facing, setFacing] = useState<"user" | "environment">("user");
  const [res, setRes] = useState<ResKey>("720p");
  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [previewing, setPreviewing] = useState(false);
  const [connected, setConnected] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "info" | "error" | "success" | "warn"; text: string } | null>(null);

  async function loadDevices() {
    const list = await navigator.mediaDevices.enumerateDevices();
    setCams(list.filter((d) => d.kind === "videoinput")); setMics(list.filter((d) => d.kind === "audioinput"));
  }

  async function startPreview(opts?: { cam?: string; mic?: string; facing?: "user" | "environment"; res?: ResKey }) {
    setMsg(null);
    try {
      tracksRef.current.forEach((t) => t.stop());
      const r = RES[opts?.res ?? res];
      const deviceId = opts?.cam ?? cam;
      const tracks = await createLocalTracks({
        audio: { deviceId: (opts?.mic ?? mic) || undefined, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        video: { deviceId: deviceId || undefined, facingMode: deviceId ? undefined : opts?.facing ?? facing, resolution: r.resolution },
      });
      tracksRef.current = tracks;
      const v = tracks.find((t) => t.kind === Track.Kind.Video) as LocalVideoTrack | undefined;
      if (v && preview.current) v.attach(preview.current);
      setPreviewing(true);
      await loadDevices();
      // If already live, swap the published tracks
      const room = roomRef.current;
      if (room && connected) {
        for (const pub of room.localParticipant.trackPublications.values()) if (pub.track) await room.localParticipant.unpublishTrack(pub.track, false);
        for (const t of tracks) await room.localParticipant.publishTrack(t, { simulcast: true, videoEncoding: r.encoding });
      }
    } catch (e) {
      setMsg({ kind: "error", text: `Camera/microphone unavailable: ${(e as Error).message}. Allow camera and microphone access in your browser settings (HTTPS is required).` });
    }
  }

  async function goLive() {
    setBusy(true); setMsg(null);
    try {
      if (!previewing) await startPreview();
      const creds = await getPublisherCredentials(streamId);
      if ("error" in creds) throw new Error(creds.error);
      const room = new Room({ dynacast: true, adaptiveStream: false });
      roomRef.current = room;
      room.on("disconnected", () => setConnected(false));
      await room.connect(creds.url!, creds.token!);
      for (const t of tracksRef.current) await room.localParticipant.publishTrack(t, { simulcast: true, videoEncoding: RES[res].encoding, name: t.kind });
      setConnected(true);
      const r = await setStreamStatus(streamId, "live");
      if ("error" in r) throw new Error(r.error);
      setStatus("live");
      setMsg({ kind: r.recording?.startsWith("Recording started") ? "success" : r.recording ? "warn" : "success", text: `You are LIVE. ${r.recording ?? ""}` });
    } catch (e) { setMsg({ kind: "error", text: (e as Error).message }); }
    setBusy(false);
  }

  async function pause() {
    setBusy(true);
    for (const t of tracksRef.current) await (t as LocalVideoTrack | LocalAudioTrack).mute();
    await setStreamStatus(streamId, "paused");
    setStatus("paused"); setBusy(false);
    setMsg({ kind: "info", text: "Broadcast paused. Viewers see a 'we'll be right back' screen." });
  }
  async function resume() {
    setBusy(true);
    for (const t of tracksRef.current) await (t as LocalVideoTrack | LocalAudioTrack).unmute();
    setCamOn(true); setMicOn(true);
    await setStreamStatus(streamId, "live");
    setStatus("live"); setBusy(false); setMsg({ kind: "success", text: "You are LIVE again." });
  }
  async function stop() {
    setBusy(true);
    const r = await setStreamStatus(streamId, "ended");
    await roomRef.current?.disconnect();
    tracksRef.current.forEach((t) => t.stop());
    setConnected(false); setPreviewing(false); setStatus("ended"); setBusy(false);
    setMsg({ kind: "success", text: `Broadcast ended. ${"recording" in r && r.recording ? r.recording : ""}` });
  }

  async function toggle(kind: "video" | "audio") {
    const t = tracksRef.current.find((x) => x.kind === kind) as LocalVideoTrack | LocalAudioTrack | undefined;
    if (!t) return;
    if (t.isMuted) await t.unmute(); else await t.mute();
    if (kind === "video") setCamOn(!t.isMuted); else setMicOn(!t.isMuted);
  }

  async function shareScreen() {
    const room = roomRef.current;
    if (!room) return;
    const on = room.localParticipant.isScreenShareEnabled;
    await room.localParticipant.setScreenShareEnabled(!on, { audio: true }).catch((e) => setMsg({ kind: "error", text: (e as Error).message }));
  }

  useEffect(() => () => { roomRef.current?.disconnect(); tracksRef.current.forEach((t) => t.stop()); }, []);

  const ended = status === "ended";
  return (
    <div className="space-y-4 rounded-2xl bg-white p-4 shadow-sm md:p-6">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-navy-950">
        <video ref={preview} className="h-full w-full object-cover" muted playsInline autoPlay style={{ transform: facing === "user" && !cam ? "scaleX(-1)" : undefined }} />
        {!previewing && <div className="absolute inset-0 flex items-center justify-center text-white/70">{ended ? "This broadcast has ended." : "Camera preview is off"}</div>}
        <div className="absolute left-3 top-3 flex gap-2">
          {status === "live" && connected && <span className="rounded bg-red-600 px-2.5 py-1 text-xs font-bold text-white">● LIVE</span>}
          {status === "paused" && <span className="rounded bg-gold-500 px-2.5 py-1 text-xs font-bold">PAUSED</span>}
          <span className="flex items-center gap-1 rounded bg-black/60 px-2.5 py-1 text-xs font-semibold text-white"><Eye className="h-3.5 w-3.5" />{viewers} watching</span>
        </div>
      </div>

      {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}

      {!ended && (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <select aria-label="Camera" value={cam} onChange={(e) => { setCam(e.target.value); if (previewing) startPreview({ cam: e.target.value }); }} className="rounded-xl border border-navy-900/10 px-3 py-2 text-sm">
              <option value="">{cams.length ? "Default camera" : "Camera (start preview to list)"}</option>
              {cams.map((d, i) => <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${i + 1}`}</option>)}
            </select>
            <select aria-label="Microphone" value={mic} onChange={(e) => { setMic(e.target.value); if (previewing) startPreview({ mic: e.target.value }); }} className="rounded-xl border border-navy-900/10 px-3 py-2 text-sm">
              <option value="">Default microphone</option>
              {mics.map((d, i) => <option key={d.deviceId} value={d.deviceId}>{d.label || `Microphone ${i + 1}`}</option>)}
            </select>
            <select aria-label="Quality" value={res} disabled={connected} onChange={(e) => setRes(e.target.value as ResKey)} className="rounded-xl border border-navy-900/10 px-3 py-2 text-sm">
              {Object.keys(RES).map((k) => <option key={k}>{k}</option>)}
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            {!previewing && <button onClick={() => startPreview()} className="flex items-center gap-2 rounded-full bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white"><Video className="h-4 w-4" />Start camera preview</button>}
            {previewing && (
              <>
                <button onClick={() => toggle("video")} className={cn("flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold ring-1 ring-navy-900/10", !camOn && "bg-red-50 text-red-700")}>{camOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}{camOn ? "Camera on" : "Camera off"}</button>
                <button onClick={() => toggle("audio")} className={cn("flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold ring-1 ring-navy-900/10", !micOn && "bg-red-50 text-red-700")}>{micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}{micOn ? "Mic on" : "Muted"}</button>
                <button onClick={() => { const f = facing === "user" ? "environment" : "user"; setFacing(f); setCam(""); startPreview({ facing: f, cam: "" }); }} className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold ring-1 ring-navy-900/10"><SwitchCamera className="h-4 w-4" />Flip camera</button>
                {connected && typeof navigator !== "undefined" && "getDisplayMedia" in (navigator.mediaDevices ?? {}) && <button onClick={shareScreen} className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold ring-1 ring-navy-900/10"><MonitorUp className="h-4 w-4" />Share screen</button>}
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-2 border-t border-navy-900/10 pt-4">
            {(!connected || status === "scheduled") && status !== "paused" && (
              <button onClick={goLive} disabled={busy} className="flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 font-bold text-white hover:bg-red-700 disabled:opacity-60"><Radio className="h-5 w-5" />{busy ? "Connecting…" : status === "live" ? "Reconnect & go live" : "Go live"}</button>
            )}
            {connected && status === "live" && <button onClick={pause} disabled={busy} className="flex items-center gap-2 rounded-full bg-gold-500 px-6 py-3 font-bold text-navy-950"><Pause className="h-5 w-5" />Pause</button>}
            {status === "paused" && connected && <button onClick={resume} disabled={busy} className="flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 font-bold text-white"><Play className="h-5 w-5" />Resume</button>}
            {status === "paused" && !connected && <button onClick={goLive} disabled={busy} className="flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 font-bold text-white"><Radio className="h-5 w-5" />Reconnect & go live</button>}
            {(connected || status === "live" || status === "paused") && <button onClick={stop} disabled={busy} className="flex items-center gap-2 rounded-full bg-navy-900 px-6 py-3 font-bold text-white"><Square className="h-5 w-5" />End broadcast</button>}
          </div>
          <p className="text-xs text-navy-800/60">Tip: on a phone, keep this tab open and the screen on while live. Use Wi-Fi or strong 4G/5G; choose 540p on weaker connections. Viewers automatically receive a lower quality if their connection is slow.</p>
        </>
      )}
    </div>
  );
}
