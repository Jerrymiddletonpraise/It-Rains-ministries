import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Status = { tone: "success" | "error"; msg: string } | null;

interface TableQuery { select?: string; order?: string; ascending?: boolean; limit?: number; eq?: Record<string, string | boolean>; }

/** Loads rows a staff member may see (RLS decides) and offers save/delete helpers that report errors plainly. */
export function useAdminTable<T extends { id: string | number }>(table: string, q: TableQuery = {}) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<Status>(null);
  const key = JSON.stringify(q);

  const reload = useCallback(async () => {
    if (!supabase) { setLoading(false); return; }
    let query = supabase.from(table).select(q.select ?? "*");
    Object.entries(q.eq ?? {}).forEach(([k, v]) => { query = query.eq(k, v); });
    if (q.order) query = query.order(q.order, { ascending: q.ascending ?? false });
    query = query.limit(q.limit ?? 200);
    const { data, error } = await query;
    if (error) setStatus({ tone: "error", msg: error.message });
    else setRows((data ?? []) as unknown as T[]);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, key]);

  useEffect(() => { void reload(); }, [reload]);

  async function save(row: Partial<T>, okMsg = "Saved.") {
    if (!supabase) return false;
    // Columns the database fills in itself are never sent back.
    const { id, ...all } = row as Record<string, unknown>;
    const rest = Object.fromEntries(Object.entries(all).filter(([k]) => !["search", "created_at", "updated_at", "created_by"].includes(k)));
    const res = id ? await supabase.from(table).update(rest).eq("id", id as string) : await supabase.from(table).insert(rest);
    if (res.error) { setStatus({ tone: "error", msg: friendly(res.error.message) }); return false; }
    setStatus({ tone: "success", msg: okMsg }); await reload(); return true;
  }

  async function remove(id: T["id"], okMsg = "Deleted.") {
    if (!supabase) return false;
    const { error } = await supabase.from(table).delete().eq("id", id as string);
    if (error) { setStatus({ tone: "error", msg: friendly(error.message) }); return false; }
    setStatus({ tone: "success", msg: okMsg }); await reload(); return true;
  }

  return { rows, loading, status, setStatus, reload, save, remove };
}

function friendly(msg: string) {
  if (/row-level security|permission denied/i.test(msg)) return "Your role does not allow this change.";
  if (/duplicate key.*slug/i.test(msg)) return "That web address (slug) is already used. Change the title or slug.";
  return msg;
}

/** Converts a value from <input type="datetime-local"> to ISO, and back. */
export const fromLocalInput = (v: string) => (v ? new Date(v).toISOString() : null);
export const toLocalInput = (iso: string | null | undefined) => {
  if (!iso) return "";
  const d = new Date(iso); const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** YouTube thumbnail for a watch/live/short URL, so sermons get artwork for free. */
export function youtubeThumb(url?: string | null) {
  if (!url) return null;
  try {
    const u = new URL(url);
    const id = u.hostname === "youtu.be" ? u.pathname.slice(1)
      : u.searchParams.get("v") ?? u.pathname.match(/\/(?:live|embed|shorts)\/([\w-]{6,})/)?.[1];
    return id && u.hostname.match(/youtube\.com|youtu\.be/) ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
  } catch { return null; }
}
