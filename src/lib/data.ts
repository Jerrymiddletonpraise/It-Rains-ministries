import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { enabled } from "@/lib/env";
import { DEFAULTS, DEFAULT_DEPARTMENTS, type Department, type SettingKey } from "@/lib/defaults";

async function db() {
  if (!enabled.supabase) return null;
  return createClient();
}

export const getSetting = cache(async <K extends SettingKey>(key: K): Promise<(typeof DEFAULTS)[K]> => {
  const s = await db();
  if (!s) return DEFAULTS[key];
  const { data } = await s.from("site_settings").select("value").eq("key", key).maybeSingle();
  if (!data) return DEFAULTS[key];
  return Array.isArray(DEFAULTS[key]) ? (data.value as (typeof DEFAULTS)[K]) : { ...DEFAULTS[key], ...(data.value as object) };
});

export const getDepartments = cache(async (): Promise<Department[]> => {
  const s = await db();
  if (!s) return DEFAULT_DEPARTMENTS;
  const { data } = await s.from("departments").select("*").eq("published", true).order("sort_order");
  return data?.length ? (data as Department[]) : DEFAULT_DEPARTMENTS;
});

export type EventRow = {
  id: string; slug: string; title: string; summary: string; description: string; category: string;
  starts_at: string; ends_at: string | null; timezone: string; location: string | null; map_query: string | null;
  is_online: boolean; online_url: string | null; capacity: number | null; image_url: string | null;
  registration_open: boolean; published: boolean;
};

export async function getUpcomingEvents(limit = 6): Promise<EventRow[]> {
  const s = await db();
  if (!s) return [];
  const { data } = await s.from("events").select("*").eq("published", true)
    .gte("starts_at", new Date(Date.now() - 6 * 3600_000).toISOString()).order("starts_at").limit(limit);
  return (data ?? []) as EventRow[];
}

export type MediaRow = {
  id: string; slug: string; title: string; description: string; speaker: string | null; category: string;
  media_type: string; video_url: string | null; audio_url: string | null; file_path: string | null;
  thumbnail_url: string | null; scripture: string | null; preached_on: string | null; duration_minutes: number | null;
  featured: boolean; published: boolean; members_only: boolean; views: number; created_at: string;
};

export async function getMedia(opts: { limit?: number; category?: string; featured?: boolean; q?: string } = {}): Promise<MediaRow[]> {
  const s = await db();
  if (!s) return [];
  let query = s.from("media_items").select("*").eq("published", true);
  if (opts.category) query = query.eq("category", opts.category);
  if (opts.featured) query = query.eq("featured", true);
  if (opts.q) query = query.or(`title.ilike.%${opts.q.replace(/[%,()]/g, "")}%,description.ilike.%${opts.q.replace(/[%,()]/g, "")}%,speaker.ilike.%${opts.q.replace(/[%,()]/g, "")}%,scripture.ilike.%${opts.q.replace(/[%,()]/g, "")}%`);
  const { data } = await query.order("preached_on", { ascending: false, nullsFirst: false }).order("created_at", { ascending: false }).limit(opts.limit ?? 24);
  return (data ?? []) as MediaRow[];
}

export async function getAnnouncements(limit = 4) {
  const s = await db();
  if (!s) return [];
  const { data } = await s.from("announcements").select("id,title,body,link_url,pinned,created_at")
    .eq("published", true).or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order("pinned", { ascending: false }).order("created_at", { ascending: false }).limit(limit);
  return data ?? [];
}

export async function getTestimonies(limit = 6) {
  const s = await db();
  if (!s) return [];
  const { data } = await s.from("testimonies").select("id,name,location,title,body,show_name,is_answered_prayer,created_at")
    .eq("status", "approved").eq("consent_to_publish", true).order("created_at", { ascending: false }).limit(limit);
  return data ?? [];
}

export type StreamRow = {
  id: string; title: string; description: string; status: string; source: string; room_name: string;
  youtube_url: string | null; scheduled_for: string | null; started_at: string | null; ended_at: string | null;
  recording_url: string | null; chat_enabled: boolean; peak_viewers: number;
  facebook_url?: string | null; instagram_url?: string | null; tiktok_url?: string | null;
  extra_links?: { label: string; url: string }[] | null;
};

export async function getCurrentStream(): Promise<StreamRow | null> {
  const s = await db();
  if (!s) return null;
  const { data: live } = await s.from("streams").select("*").in("status", ["live", "paused"]).order("started_at", { ascending: false }).limit(1).maybeSingle();
  if (live) return live as StreamRow;
  const { data: next } = await s.from("streams").select("*").eq("status", "scheduled")
    .gte("scheduled_for", new Date(Date.now() - 3600_000).toISOString()).order("scheduled_for").limit(1).maybeSingle();
  return (next as StreamRow) ?? null;
}

/** Resolves `storage://bucket/path` references to short-lived signed URLs (private buckets). */
export async function resolveMediaUrl(url: string | null | undefined, seconds = 6 * 3600) {
  if (!url) return null;
  if (!url.startsWith("storage://")) return url;
  const [, rest] = url.split("storage://");
  const [bucket, ...parts] = rest.split("/");
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const { data } = await createAdminClient().storage.from(bucket).createSignedUrl(parts.join("/"), seconds);
  return data?.signedUrl ?? null;
}
