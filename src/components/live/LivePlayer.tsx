"use client";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Room, RoomEvent, Track, VideoQuality, type RemoteTrack, type RemoteTrackPublication } from "livekit-client";
import { Maximize, Volume2, VolumeX, Eye, Share2, Radio } from "lucide-react";
import { useViewerCount } from "./usePresence";
import { streamPlatforms, type PlatformLink } from "@/lib/utils";
import { FacebookIcon, InstagramIcon, TiktokIcon, YoutubeIcon } from "@/components/ui/SocialIcons";

type Stream = {
  id: string; title: string; status: string; source: string; youtube_url: string | null;
  facebook_url?: string | null; instagram_url?: string | null; tiktok_url?: string | null; extra_links?: { label: string; url: string }[] | null;
};
const EXTERNAL = ["youtube", "facebook"];
const QUALITIES: [string, VideoQuality][] = [["Auto / HD", VideoQuality.HIGH], ["Standard", VideoQuality.MEDIUM], ["Data saver", VideoQuality.LOW]];

export function LivePlayer({ stream, livekit }: { stream: Stream; livekit: boolean }) {
  const viewers = useViewerCount(stream.id);
  const wrap = useRef<HTMLDivElement>(null);
  const videoEl = useRef<HTMLVideoElement>(null);
  const audioEl = useRef<HTMLAudioElement>(null);
  const roomRef = useRef<Room | null>(null);
  const [state, setState] = useState<"connecting" | "waiting" | "playing" | "error">("connecting");
  const [muted, setMuted] = useState(true);
  const [quality, setQuality] = useState(0);
  const [msg, setMsg] = useState("");
  const [shared, setShared] = useState(false);
  const platforms = streamPlatforms(stream);
  const players = EXTERNAL.includes(stream.source) ? platforms.filter((p) => p.embed) : [];
  const [active, setActive] = useState(() => Math.max(0, players.findIndex((p) => p.key === stream.source)));
  const current = players[active] ?? players[0];
  const embed = current ? withAutoplay(current) : null;
  const external = EXTERNAL.includes(stream.source);

  const applyQuality = useCallback((idx: number) => {
    roomRef.current?.remoteParticipants.forEach((p) => p.videoTrackPublications.forEach((pub) => pub.setVideoQuality(QUALITIES[idx][1])));
  }, []);

  useEffect(() => {
    if (external || !livekit) return;
    let cancelled = false;
    const room = new Room({ adaptiveStream: true, dynacast: true });
    roomRef.current = room;
    const attach = (track: RemoteTrack) => {
      if (track.kind === Track.Kind.Video && videoEl.current) { track.attach(videoEl.current); setState("playing"); }
      if (track.kind === Track.Kind.Audio && audioEl.current) track.attach(audioEl.current);
    };
    room
      .on(RoomEvent.TrackSubscribed, (t: RemoteTrack, pub: RemoteTrackPublication) => { attach(t); if (t.kind === Track.Kind.Video) pub.setVideoQuality(QUALITIES[quality][1]); })
      .on(RoomEvent.TrackUnsubscribed, (t: RemoteTrack) => { t.detach(); if (t.kind === Track.Kind.Video) setState("waiting"); })
      .on(RoomEvent.TrackMuted, (pub) => { if (pub.kind === Track.Kind.Video) setState("waiting"); })
      .on(RoomEvent.TrackUnmuted, (pub) => { if (pub.kind === Track.Kind.Video) setState("playing"); })
      .on(RoomEvent.Disconnected, () => !cancelled && setState("waiting"));
    (async () => {
      try {
        const res = await fetch("/api/live/token", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ streamId: stream.id }) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        await room.connect(data.url, data.token);
        if (cancelled) return;
        let found = false;
        room.remoteParticipants.forEach((p) => p.trackPublications.forEach((pub) => { if (pub.track) { attach(pub.track as RemoteTrack); found = true; } }));
        if (!found) setState("waiting");
      } catch (e) { if (!cancelled) { setState("error"); setMsg((e as Error).message); } }
    })();
    return () => { cancelled = true; room.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stream.id, external, livekit]);

  const toggleMute = async () => {
    const next = !muted;
    setMuted(next);
    if (audioEl.current) audioEl.current.muted = next;
    if (!next) await roomRef.current?.startAudio().catch(() => null);
  };
  const fullscreen = () => {
    const el = wrap.current as (HTMLDivElement & { webkitRequestFullscreen?: () => void }) | null;
    const v = videoEl.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    if (el?.requestFullscreen) el.requestFullscreen(); else if (el?.webkitRequestFullscreen) el.webkitRequestFullscreen(); else v?.webkitEnterFullscreen?.();
  };
  const share = async () => {
    const url = window.location.href;
    if (navigator.share) await navigator.share({ title: stream.title, text: "Join me watching IT RAINS MINISTRIES live", url }).catch(() => null);
    else { await navigator.clipboard.writeText(url); setShared(true); setTimeout(() => setShared(false), 2500); }
  };

  return (
    <div>
      <div ref={wrap} className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-2xl">
        {embed ? (
          <iframe key={embed} src={embed} title={`${stream.title} on ${current?.label}`} className="absolute inset-0 h-full w-full" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
        ) : (
          <>
            <video ref={videoEl} className="absolute inset-0 h-full w-full object-contain" playsInline autoPlay muted />
            <audio ref={audioEl} autoPlay muted={muted} />
            {state !== "playing" && (
              <div className="bg-heaven absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white">
                <Radio className="h-12 w-12 text-gold-400" />
                <p className="mt-3 font-serif text-2xl">
                  {external ? "The broadcast link will appear here shortly" : !livekit ? "Live streaming is being set up" : state === "connecting" ? "Connecting to the broadcast…" : state === "error" ? "We couldn't connect" : stream.status === "paused" ? "The broadcast is paused, we'll be right back" : "Waiting for the broadcast to begin…"}
                </p>
                {state === "error" && <p className="mt-2 text-sm text-white/70">{msg}</p>}
              </div>
            )}
            {state === "playing" && muted && (
              <button onClick={toggleMute} className="absolute inset-x-0 bottom-16 mx-auto w-max rounded-full bg-gold-500 px-5 py-2.5 font-bold text-navy-950 shadow-lg">
                <VolumeX className="mr-2 inline h-5 w-5" />Tap to unmute
              </button>
            )}
          </>
        )}
        <div className="pointer-events-none absolute left-3 top-3 flex gap-2">
          {stream.status === "live" && <span className="rounded bg-red-600 px-2.5 py-1 text-xs font-bold text-white">● LIVE</span>}
          <span className="flex items-center gap-1 rounded bg-black/60 px-2.5 py-1 text-xs font-semibold text-white"><Eye className="h-3.5 w-3.5" />{viewers.toLocaleString()} watching</span>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {!external && (
          <>
            <button onClick={toggleMute} className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-sm">{muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}{muted ? "Unmute" : "Mute"}</button>
            <label className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-sm">
              Quality
              <select value={quality} onChange={(e) => { const i = Number(e.target.value); setQuality(i); applyQuality(i); }} className="bg-transparent">
                {QUALITIES.map(([l], i) => <option key={l} value={i}>{l}</option>)}
              </select>
            </label>
            <button onClick={fullscreen} className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-sm"><Maximize className="h-4 w-4" />Full screen</button>
          </>
        )}
        <button onClick={share} className="flex items-center gap-2 rounded-full bg-royal-700 px-4 py-2 text-sm font-semibold text-white"><Share2 className="h-4 w-4" />{shared ? "Link copied!" : "Share"}</button>
        <ShareLinks title={stream.title} />
      </div>
      {platforms.length > 0 && (
        <div className="mt-4 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
          <p className="text-sm font-semibold text-white">{players.length > 1 ? "Choose where to watch on this page, or open the app you prefer" : "Also live on"}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {platforms.map((p) => {
              const idx = players.findIndex((x) => x.key === p.key);
              const Icon = ICONS[p.key];
              const cls = "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold";
              return idx >= 0 && players.length > 1 ? (
                <button key={p.key} onClick={() => setActive(idx)} aria-pressed={idx === active}
                  className={`${cls} ${idx === active ? "bg-gold-500 text-navy-950" : "bg-white/10 text-white hover:bg-white/20"}`}>
                  {Icon && <Icon className="h-4 w-4" />}Play {p.label} here
                </button>
              ) : (
                <a key={p.key} href={p.url} target="_blank" rel="noopener noreferrer" className={`${cls} bg-white/10 text-white hover:bg-white/20`}>
                  {Icon && <Icon className="h-4 w-4" />}Watch on {p.label} ↗
                </a>
              );
            })}
          </div>
          {platforms.some((p) => !p.embed) && (
            <p className="mt-3 text-xs text-white/55">Instagram and TikTok don&apos;t allow their live videos to play inside other websites, so those buttons open the app.</p>
          )}
        </div>
      )}
    </div>
  );
}

const ICONS: Record<string, ((p: { className?: string }) => ReactNode) | undefined> = {
  youtube: YoutubeIcon, facebook: FacebookIcon, instagram: InstagramIcon, tiktok: TiktokIcon,
};

function withAutoplay(p: PlatformLink) {
  const e = p.embed!;
  const sep = e.includes("?") ? "&" : "?";
  return p.key === "facebook" ? `${e}${sep}autoplay=true` : `${e}${sep}autoplay=1`;
}

function ShareLinks({ title }: { title: string }) {
  const [url, setUrl] = useState("");
  useEffect(() => setUrl(window.location.href), []);
  if (!url) return null;
  const u = encodeURIComponent(url), t = encodeURIComponent(`Watch live: ${title}`);
  const links = [
    ["Facebook", `https://www.facebook.com/sharer/sharer.php?u=${u}`],
    ["WhatsApp", `https://wa.me/?text=${t}%20${u}`],
    ["X", `https://twitter.com/intent/tweet?text=${t}&url=${u}`],
  ];
  return <>{links.map(([l, h]) => <a key={l} href={h} target="_blank" rel="noopener noreferrer" className="rounded-full border border-navy-900/10 bg-white px-4 py-2 text-sm font-semibold">{l}</a>)}</>;
}
