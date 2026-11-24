import { NextResponse } from "next/server";
import { WebhookReceiver } from "livekit-server-sdk";
import { createAdminClient } from "@/lib/supabase/admin";
import { env, enabled } from "@/lib/env";
import { startRecording } from "@/lib/livekit";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!enabled.livekit) return NextResponse.json({ error: "not configured" }, { status: 400 });
  const receiver = new WebhookReceiver(env.livekitKey, env.livekitSecret);
  let event;
  try {
    event = await receiver.receive(await req.text(), req.headers.get("authorization") ?? undefined);
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }
  const db = createAdminClient();

  // OBS / encoder started sending: mark the broadcast live and start recording.
  if (event.event === "ingress_started" && event.ingressInfo?.roomName) {
    const { data: s } = await db.from("streams").select("id,status,record,started_at").eq("room_name", event.ingressInfo.roomName).maybeSingle();
    if (s && s.status !== "ended") {
      await db.from("streams").update({ status: "live", started_at: s.started_at ?? new Date().toISOString() }).eq("id", s.id);
      const { data: sec } = await db.from("stream_secrets").select("egress_id").eq("stream_id", s.id).maybeSingle();
      if (s.record && enabled.recording && !sec?.egress_id) {
        const egressId = await startRecording(event.ingressInfo.roomName, s.id).catch(() => null);
        if (egressId) await db.from("stream_secrets").update({ egress_id: egressId }).eq("stream_id", s.id);
      }
    }
  }
  if (event.event === "ingress_ended" && event.ingressInfo?.roomName) {
    await db.from("streams").update({ status: "paused" }).eq("room_name", event.ingressInfo.roomName).eq("status", "live");
  }

  // Recording finished: save it to the media library as a replay.
  if (event.event === "egress_ended" && event.egressInfo) {
    const file = event.egressInfo.fileResults?.[0];
    const room = event.egressInfo.roomName;
    const { data: s } = await db.from("streams").select("id,title,description,started_at").eq("room_name", room).maybeSingle();
    if (s && file?.filename) {
      const url = env.recordingS3.publicBaseUrl ? `${env.recordingS3.publicBaseUrl.replace(/\/$/, "")}/${file.filename}` : `storage://${env.recordingS3.bucket}/${file.filename}`;
      await db.from("streams").update({ recording_url: url }).eq("id", s.id);
      await db.from("stream_secrets").update({ egress_id: null }).eq("stream_id", s.id);
      const date = (s.started_at ?? new Date().toISOString()).slice(0, 10);
      await db.from("media_items").insert({
        slug: `${slugify(s.title)}-${date}-${s.id.slice(0, 6)}`, title: s.title, description: s.description || "Replay of our live broadcast.",
        category: "live_replay", media_type: "video", video_url: url, preached_on: date,
        duration_minutes: file.duration ? Math.round(Number(file.duration) / 6e10) : null, published: true, stream_id: s.id,
      });
    }
  }
  return NextResponse.json({ ok: true });
}
