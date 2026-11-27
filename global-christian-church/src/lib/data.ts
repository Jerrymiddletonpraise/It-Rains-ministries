import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CollectionResult<T> { data: T[]; isDemo: boolean; loading: boolean; error: string | null; }

interface Query { order?: string; ascending?: boolean; limit?: number; eq?: Record<string, string | number | boolean>; gte?: Record<string, string>; }

/**
 * Reads a published collection from Supabase. Falls back to labelled demo content when
 * Supabase is not configured yet or the church has not published any rows.
 */
export function useCollection<T>(table: string, demo: T[], q: Query = {}): CollectionResult<T> {
  const key = JSON.stringify([table, q]);
  const [state, setState] = useState<CollectionResult<T>>({ data: supabase ? [] : demo, isDemo: !supabase, loading: Boolean(supabase), error: null });

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    let query = supabase.from(table).select("*");
    Object.entries(q.eq ?? {}).forEach(([k, v]) => { query = query.eq(k, v); });
    Object.entries(q.gte ?? {}).forEach(([k, v]) => { query = query.gte(k, v); });
    if (q.order) query = query.order(q.order, { ascending: q.ascending ?? false });
    if (q.limit) query = query.limit(q.limit);
    query.then(({ data, error }) => {
      if (cancelled) return;
      if (error) { console.error(`[gcc] ${table}:`, error.message); setState({ data: demo, isDemo: true, loading: false, error: error.message }); return; }
      const rows = (data ?? []) as T[];
      setState(rows.length ? { data: rows, isDemo: false, loading: false, error: null } : { data: demo, isDemo: true, loading: false, error: null });
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return state;
}

/* ---------- Site settings (editable from the Control Center) ---------- */

export interface ChurchProfile { name: string; tagline: string; address: string | null; phone: string | null; email: string | null; whatsapp: string | null; timezone: string | null; }
export interface SeniorPastor { name: string | null; title: string; bio: string | null; photo_url: string | null; email: string | null; }
export interface SocialLinks { youtube: string | null; facebook: string | null; instagram: string | null; tiktok: string | null; twitch: string | null; x: string | null; }
export interface HeroSettings { headline: string; subheadline: string; image_url: string | null; video_url: string | null; }
export interface RichText { title?: string; body: string | null; }
export interface MissionVision { mission: string | null; vision: string | null; values: string[]; }
export interface Beliefs { intro: string | null; items: { title: string; body: string }[]; }
export interface ServiceTime { label: string; day: string; time: string; }

export interface SiteSettings {
  church_profile: ChurchProfile; senior_pastor: SeniorPastor; social: SocialLinks; hero: HeroSettings;
  welcome: RichText; about: RichText; mission_vision: MissionVision; beliefs: Beliefs; service_times: ServiceTime[];
}

export const defaultSettings: SiteSettings = {
  church_profile: { name: "Global Christian Church", tagline: "One Faith. One Family. Reaching the World.", address: null, phone: null, email: null, whatsapp: null, timezone: null },
  senior_pastor: { name: null, title: "Senior Pastor", bio: null, photo_url: null, email: null },
  social: { youtube: null, facebook: null, instagram: null, tiktok: null, twitch: null, x: null },
  hero: { headline: "One Faith. One Family. Reaching the World.", subheadline: "Worship with Global Christian Church in person or online, wherever you are in the world.", image_url: null, video_url: null },
  welcome: { title: "Welcome home", body: null },
  about: { title: "About Global Christian Church", body: null },
  mission_vision: { mission: null, vision: null, values: [] },
  beliefs: { intro: null, items: [] },
  service_times: [],
};

let cache: Promise<Partial<SiteSettings>> | null = null;
function loadSettings(): Promise<Partial<SiteSettings>> {
  if (!supabase) return Promise.resolve({});
  cache ??= Promise.resolve(supabase.from("site_settings").select("key,value")).then(({ data, error }) => {
    if (error) { console.error("[gcc] site_settings:", error.message); return {}; }
    return Object.fromEntries((data ?? []).map((r: { key: string; value: unknown }) => [r.key, r.value]));
  });
  return cache;
}
export function invalidateSettings() { cache = null; }

export function useSettings() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loaded, setLoaded] = useState(!supabase);
  useEffect(() => {
    loadSettings().then((s) => {
      const merged = { ...defaultSettings } as Record<string, unknown>;
      for (const [k, v] of Object.entries(s)) {
        const base = (defaultSettings as unknown as Record<string, unknown>)[k];
        merged[k] = Array.isArray(base) ? v : { ...(base as object), ...(v as object) };
      }
      setSettings(merged as unknown as SiteSettings); setLoaded(true);
    });
  }, []);
  return { settings, loaded };
}

/* ---------- Form submissions ---------- */

export type SubmitResult = { ok: true } | { ok: false; reason: "not_configured" | "error"; message: string };

export async function insertRow(table: string, row: Record<string, unknown>): Promise<SubmitResult> {
  if (!supabase) return { ok: false, reason: "not_configured", message: "The church database is awaiting configuration, so this form cannot be saved yet. Nothing was sent." };
  const { error } = await supabase.from(table).insert(row);
  // 23505 = unique violation, e.g. an email already subscribed: treat as success, reveal nothing.
  if (error && error.code !== "23505") { console.error(`[gcc] insert ${table}:`, error.message); return { ok: false, reason: "error", message: "Something went wrong saving your submission. Please try again in a moment." }; }
  return { ok: true };
}
