"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireArea } from "@/lib/auth";
import { enabled, env } from "@/lib/env";
import { parseExtraLinks } from "@/lib/utils";
import { createRtmpIngress, ensureRoom, publisherToken, startRecording, stopRecording, participantCount } from "@/lib/livekit";
import type { ActionState } from "@/components/forms/ActionForm";
import { sendPushToAll } from "@/lib/push";

function url(f: FormData, k: string) {
  const v = String(f.get(k) ?? "").trim();
  try { return v && ["http:", "https:"].includes(new URL(v).protocol) ? v : null; } catch { return null; }
}
/** Links to the same broadcast on YouTube, Facebook, Instagram, TikTok and any other app. */
function platformFields(f: FormData) {
  return {
    youtube_url: url(f, "youtube_url"), facebook_url: url(f, "facebook_url"),
    instagram_url: url(f, "instagram_url"), tiktok_url: url(f, "tiktok_url"),
    extra_links: parseExtraLinks(String(f.get("extra_links") ?? "")),
  };
}

export async function createStream(_: ActionState, f: FormData): Promise<ActionState> {
  const { supabase, user } = await requireArea("live");
  const title = String(f.get("title") ?? "").trim();
  if (title.length < 3) return { ok: false, message: "Please give the broadcast a title." };
  const source = String(f.get("source") ?? "browser");
  const iso = String(f.get("scheduled_for__iso") ?? "");
  if (source === "youtube" && !url(f, "youtube_url")) return { ok: false, message: "Paste the YouTube live link." };
  if (source === "facebook" && !url(f, "facebook_url")) return { ok: false, message: "Paste the Facebook live video link." };
  const { data, error } = await supabase.from("streams").insert({
    title, description: String(f.get("description") ?? ""), source: ["browser", "rtmp", "youtube", "facebook"].includes(source) ? source : "browser",
    ...platformFields(f), scheduled_for: iso || null,
    record: f.get("record") === "on", chat_enabled: f.get("chat_enabled") === "on", created_by: user.id,
  }).select("id").single();
  if (error) return { ok: false, message: error.message };
  await supabase.from("stream_secrets").insert({ stream_id: data.id });
  redirect(`/admin/live/${data.id}`);
}

export async function getPublisherCredentials(streamId: string) {
  const { supabase, user } = await requireArea("live");
  if (!enabled.livekit) return { error: "LiveKit is not configured. Add the LIVEKIT_* environment variables." };
  const { data: s } = await supabase.from("streams").select("room_name,status").eq("id", streamId).single();
  if (!s || s.status === "ended") return { error: "This broadcast has ended." };
  await ensureRoom(s.room_name);
  return { token: await publisherToken(s.room_name, user.id, (user.user_metadata?.full_name as string) || "IT RAINS Live"), url: env.livekitUrl };
}

export async function setStreamStatus(streamId: string, status: "live" | "paused" | "ended" | "scheduled") {
  const { supabase } = await requireArea("live");
  const { data: s } = await supabase.from("streams").select("*").eq("id", streamId).single();
  if (!s) return { error: "Not found" };
  const update: Record<string, unknown> = { status };
  if (status === "live" && !s.started_at) update.started_at = new Date().toISOString();
  if (status === "ended") update.ended_at = new Date().toISOString();
  if (status === "ended" && enabled.livekit && !["youtube", "facebook"].includes(s.source)) update.peak_viewers = Math.max(s.peak_viewers, await participantCount(s.room_name));
  const { error } = await supabase.from("streams").update(update).eq("id", streamId);
  if (error) return { error: error.message };

  let recording: string | null = null;
  if (!["youtube", "facebook"].includes(s.source) && enabled.livekit) {
    const { data: sec } = await supabase.from("stream_secrets").select("egress_id").eq("stream_id", streamId).single();
    if (status === "live" && s.record && !sec?.egress_id) {
      if (!enabled.recording) recording = "Recording is not configured (RECORDING_S3_* variables), so this broadcast is not being recorded.";
      else {
        try {
          const egressId = await startRecording(s.room_name, streamId);
          await supabase.from("stream_secrets").update({ egress_id: egressId }).eq("stream_id", streamId);
          recording = "Recording started.";
        } catch (e) { recording = `Recording could not start: ${(e as Error).message}`; }
      }
    }
    if (status === "ended" && sec?.egress_id) { await stopRecording(sec.egress_id); recording = "Recording stopped. The replay will appear in the media library when processing finishes."; }
  }
  if (status === "live" && !s.started_at) await sendPushToAll({ title: "We're LIVE now 🔴", body: s.title, url: "/watch" }).catch(() => null);
  revalidatePath("/watch"); revalidatePath("/"); revalidatePath(`/admin/live/${streamId}`);
  return { ok: true, recording };
}

export async function createIngressForStream(streamId: string) {
  const { supabase } = await requireArea("live");
  if (!enabled.livekit) return { error: "LiveKit is not configured." };
  const { data: s } = await supabase.from("streams").select("room_name,title").eq("id", streamId).single();
  if (!s) return { error: "Not found" };
  await ensureRoom(s.room_name);
  const ing = await createRtmpIngress(s.room_name, s.title);
  await supabase.from("stream_secrets").upsert({ stream_id: streamId, ingress_id: ing.ingressId, rtmp_url: ing.url, stream_key: ing.streamKey });
  revalidatePath(`/admin/live/${streamId}`);
  return { ok: true };
}

export async function updateStreamSettings(streamId: string, f: FormData) {
  const { supabase } = await requireArea("live");
  await supabase.from("streams").update({
    title: String(f.get("title") ?? ""), description: String(f.get("description") ?? ""), ...platformFields(f),
    chat_enabled: f.get("chat_enabled") === "on", record: f.get("record") === "on",
  }).eq("id", streamId);
  revalidatePath(`/admin/live/${streamId}`); revalidatePath("/watch");
}

export async function deleteStream(f: FormData) {
  const { supabase } = await requireArea("live");
  await supabase.from("streams").delete().eq("id", String(f.get("id")));
  redirect("/admin/live");
}
