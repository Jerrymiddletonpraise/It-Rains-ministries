import { useEffect, useState, type FormEvent } from "react";
import { CircleStop, ExternalLink, Eye, EyeOff, Pencil, Radio, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { defaultSettings, invalidateSettings, type StreamingSettings } from "@/lib/data";
import { fromLocalInput, toLocalInput, useAdminTable, type Status } from "@/lib/admin";
import type { Broadcast } from "@/lib/types";
import { channelLiveEmbed, formatDateTime, toEmbedUrl } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Checkbox, Field, Input, Textarea } from "@/components/ui/Form";
import { AdminHeader, Empty, Panel, Pill, StatusNotice } from "@/components/admin/AdminUI";

type Row = Broadcast & { chat_enabled: boolean };
interface ChatRow { id: string; broadcast_id: string; display_name: string; body: string; status: string; created_at: string; }
const blank = (): Partial<Row> => ({ title: "Sunday Worship Service", description: "", scheduled_start: "", scheduled_end: null, embed_url: "", scripture_reference: "", scripture_text: "", chat_enabled: true });

export default function Streaming() {
  const t = useAdminTable<Row>("broadcast_schedules", { order: "scheduled_start", ascending: false, limit: 50 });
  const [form, setForm] = useState<Partial<Row> | null>(null);
  const [channelId, setChannelId] = useState<string | null>(null);
  const live = t.rows.find((b) => b.status === "live") ?? null;
  const set = (k: keyof Row, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: FormEvent) {
    e.preventDefault(); if (!form) return;
    if (form.embed_url && !toEmbedUrl(form.embed_url)) { t.setStatus({ tone: "error", msg: "That video link is not supported. Paste a YouTube or Facebook video link." }); return; }
    const row = { ...form, embed_url: form.embed_url?.trim() || null, description: form.description || null, scripture_reference: form.scripture_reference || null, scripture_text: form.scripture_text || null };
    if (await t.save(row, form.id ? "Broadcast updated." : "Broadcast scheduled. It now shows on the Watch Live page.")) setForm(null);
  }

  async function goLive(b: Row) {
    if (!b.embed_url && !channelLiveEmbed(channelId)) { t.setStatus({ tone: "error", msg: "Add the YouTube or Facebook link for this broadcast first (Edit), or set your YouTube channel ID below, so viewers have something to watch." }); return; }
    for (const other of t.rows.filter((x) => x.status === "live" && x.id !== b.id)) await supabase?.from("broadcast_schedules").update({ status: "ended" }).eq("id", other.id);
    await t.save({ id: b.id, status: "live" } as Partial<Row>, `“${b.title}” is live. Viewers on the Watch Live page see it now.`);
  }

  return (
    <div>
      <AdminHeader title="Live streaming" intro="Schedule services, go live and moderate chat. Viewers always watch for free, with no account needed." action={!form && <Button onClick={() => setForm(blank())}><Radio className="h-4 w-4" />Schedule a broadcast</Button>} />
      <StatusNotice status={t.status} />

      {live && (
        <Panel className="mb-6 border-red-400/40">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><Pill value="live" /><p className="mt-2 font-display text-2xl">{live.title}</p><p className="text-xs text-ivory-muted">{live.embed_url ?? "Playing your YouTube channel's live stream"}</p></div>
            <div className="flex gap-2">
              <a href="/watch" target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-2 rounded-full border border-line px-4 text-xs text-ivory-muted hover:text-ivory"><ExternalLink className="h-3.5 w-3.5" />View as viewer</a>
              <Button size="sm" variant="outline" onClick={() => t.save({ id: live.id, status: "ended" } as Partial<Row>, "Broadcast ended. Remember to add the recording to the sermon library.")}><CircleStop className="h-4 w-4" />End broadcast</Button>
            </div>
          </div>
        </Panel>
      )}

      {form && (
        <Panel className="mb-8">
          <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
            <div className="flex items-center justify-between sm:col-span-2"><h2 className="text-2xl">{form.id ? "Edit broadcast" : "Schedule a broadcast"}</h2><button type="button" onClick={() => setForm(null)} aria-label="Close" className="text-ivory-muted hover:text-ivory"><X className="h-5 w-5" /></button></div>
            <Field label="Title" htmlFor="b-title" required className="sm:col-span-2"><Input id="b-title" required value={form.title ?? ""} onChange={(e) => set("title", e.target.value)} /></Field>
            <Field label="Starts" htmlFor="b-start" required><Input id="b-start" type="datetime-local" required value={toLocalInput(form.scheduled_start)} onChange={(e) => set("scheduled_start", fromLocalInput(e.target.value))} /></Field>
            <Field label="Ends" htmlFor="b-end"><Input id="b-end" type="datetime-local" value={toLocalInput(form.scheduled_end)} onChange={(e) => set("scheduled_end", fromLocalInput(e.target.value))} /></Field>
            <Field label="YouTube or Facebook live link" htmlFor="b-url" className="sm:col-span-2" hint="Paste the link of this live stream, e.g. https://www.youtube.com/live/abc123 or a Facebook video link. Leave empty to play your YouTube channel automatically.">
              <Input id="b-url" type="url" value={form.embed_url ?? ""} onChange={(e) => set("embed_url", e.target.value)} placeholder="https://www.youtube.com/live/..." />
            </Field>
            <Field label="Description" htmlFor="b-desc" className="sm:col-span-2"><Textarea id="b-desc" rows={3} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} /></Field>
            <Field label="Scripture reference" htmlFor="b-ref"><Input id="b-ref" value={form.scripture_reference ?? ""} onChange={(e) => set("scripture_reference", e.target.value)} placeholder="Psalm 34:18" /></Field>
            <Field label="Scripture text" htmlFor="b-txt"><Input id="b-txt" value={form.scripture_text ?? ""} onChange={(e) => set("scripture_text", e.target.value)} /></Field>
            <div className="sm:col-span-2"><Checkbox id="b-chat" label="Allow live chat for signed-in members" checked={form.chat_enabled ?? true} onChange={(e) => set("chat_enabled", e.target.checked)} /></div>
            <div className="flex gap-3 sm:col-span-2"><Button type="submit">{form.id ? "Save changes" : "Schedule broadcast"}</Button><Button type="button" variant="ghost" onClick={() => setForm(null)}>Cancel</Button></div>
          </form>
        </Panel>
      )}

      <h2 className="mb-4 text-2xl">Broadcasts</h2>
      {t.rows.length ? (
        <ul className="space-y-3">
          {t.rows.map((b) => (
            <li key={b.id} className="flex flex-col gap-3 rounded-2xl border border-line bg-charcoal p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0"><div className="flex items-center gap-3"><Pill value={b.status} /><p className="truncate font-semibold">{b.title}</p></div><p className="mt-1 text-xs text-ivory-muted">{formatDateTime(b.scheduled_start)}{b.embed_url ? " · link added" : " · no link yet"}</p></div>
              <div className="flex shrink-0 flex-wrap gap-2">
                {b.status === "scheduled" && <Button size="sm" onClick={() => goLive(b)}><Radio className="h-4 w-4" />Go live</Button>}
                {b.status === "live" && <Button size="sm" variant="outline" onClick={() => t.save({ id: b.id, status: "ended" } as Partial<Row>, "Broadcast ended.")}>End</Button>}
                {b.status === "scheduled" && <Button size="sm" variant="ghost" onClick={() => t.save({ id: b.id, status: "cancelled" } as Partial<Row>, "Broadcast cancelled.")}>Cancel</Button>}
                <Button size="sm" variant="ghost" onClick={() => setForm(b)} aria-label={`Edit ${b.title}`}><Pencil className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => confirm(`Delete “${b.title}”?`) && t.remove(b.id, "Broadcast deleted.")} aria-label={`Delete ${b.title}`}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </li>
          ))}
        </ul>
      ) : <Empty>{t.loading ? "Loading…" : "No broadcasts yet. Schedule your first service and it will appear on the Watch Live page with a countdown."}</Empty>}

      {live && live.chat_enabled && <ChatModeration broadcastId={live.id} />}
      <ChannelSettings onLoaded={setChannelId} />
      <HowToStream />
    </div>
  );
}

function ChannelSettings({ onLoaded }: { onLoaded: (id: string | null) => void }) {
  const [v, setV] = useState<StreamingSettings>(defaultSettings.streaming);
  const [status, setStatus] = useState<Status>(null);
  useEffect(() => {
    supabase?.from("site_settings").select("value").eq("key", "streaming").maybeSingle().then(({ data }) => {
      const merged = { ...defaultSettings.streaming, ...((data?.value as object) ?? {}) }; setV(merged); onLoaded(merged.youtube_channel_id);
    });
  }, [onLoaded]);
  async function save(e: FormEvent) {
    e.preventDefault(); if (!supabase) return;
    const id = v.youtube_channel_id?.trim() || null;
    if (id && !channelLiveEmbed(id)) { setStatus({ tone: "error", msg: "A YouTube channel ID starts with UC and is 24 characters long. Find it at youtube.com/account_advanced." }); return; }
    const value = { ...v, youtube_channel_id: id, facebook_page_url: v.facebook_page_url?.trim() || null };
    const { error } = await supabase.from("site_settings").upsert({ key: "streaming", value });
    if (error) setStatus({ tone: "error", msg: error.message }); else { invalidateSettings(); onLoaded(id); setStatus({ tone: "success", msg: "Streaming settings saved." }); }
  }
  return (
    <Panel className="mt-10">
      <h2 className="text-2xl">Channel settings</h2>
      <p className="mt-1 text-sm text-ivory-muted">With your YouTube channel ID set, the Watch Live page plays whatever you are streaming on YouTube, automatically, even if you forget to press Go live here.</p>
      <form onSubmit={save} className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field label="YouTube channel ID" htmlFor="s-yt" hint="Starts with UC. Find it at youtube.com/account_advanced."><Input id="s-yt" value={v.youtube_channel_id ?? ""} onChange={(e) => setV({ ...v, youtube_channel_id: e.target.value })} placeholder="UCxxxxxxxxxxxxxxxxxxxxxx" /></Field>
        <Field label="Facebook page link" htmlFor="s-fb" hint="Shown as “Also watch on Facebook”."><Input id="s-fb" type="url" value={v.facebook_page_url ?? ""} onChange={(e) => setV({ ...v, facebook_page_url: e.target.value })} placeholder="https://www.facebook.com/..." /></Field>
        <div className="sm:col-span-2"><Checkbox id="s-auto" label="Play my YouTube channel's live stream on the Watch Live page whenever no broadcast is marked live" checked={v.auto_play_channel} onChange={(e) => setV({ ...v, auto_play_channel: e.target.checked })} /></div>
        <div className="sm:col-span-2"><Button type="submit">Save streaming settings</Button></div>
        {status && <div className="sm:col-span-2"><StatusNotice status={status} className="mb-0" /></div>}
      </form>
    </Panel>
  );
}

function ChatModeration({ broadcastId }: { broadcastId: string }) {
  const [rows, setRows] = useState<ChatRow[]>([]);
  useEffect(() => {
    if (!supabase) return;
    const sb = supabase;
    const load = () => sb.from("live_chat_messages").select("id,broadcast_id,display_name,body,status,created_at").eq("broadcast_id", broadcastId).order("created_at", { ascending: false }).limit(50).then(({ data }) => setRows((data ?? []) as ChatRow[]));
    void load();
    const ch = sb.channel(`mod-${broadcastId}`).on("postgres_changes", { event: "*", schema: "public", table: "live_chat_messages", filter: `broadcast_id=eq.${broadcastId}` }, () => void load()).subscribe();
    return () => { void sb.removeChannel(ch); };
  }, [broadcastId]);
  async function toggle(m: ChatRow) {
    await supabase?.from("live_chat_messages").update({ status: m.status === "hidden" ? "visible" : "hidden" }).eq("id", m.id);
    setRows((r) => r.map((x) => (x.id === m.id ? { ...x, status: m.status === "hidden" ? "visible" : "hidden" } : x)));
  }
  return (
    <Panel className="mt-10">
      <h2 className="text-2xl">Live chat moderation</h2>
      <p className="mt-1 text-sm text-ivory-muted">Hidden messages disappear for viewers immediately.</p>
      <ul className="mt-5 max-h-96 space-y-2 overflow-y-auto">
        {rows.map((m) => (
          <li key={m.id} className="flex items-start justify-between gap-3 rounded-xl border border-line p-3 text-sm">
            <p className={m.status === "hidden" ? "opacity-40 line-through" : ""}><span className="font-semibold text-gold-light">{m.display_name}</span> {m.body}</p>
            <Button size="sm" variant="ghost" onClick={() => toggle(m)} aria-label={m.status === "hidden" ? "Show message" : "Hide message"}>{m.status === "hidden" ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</Button>
          </li>
        ))}
        {!rows.length && <li className="text-sm text-ivory-muted">No chat messages yet.</li>}
      </ul>
    </Panel>
  );
}

function HowToStream() {
  return (
    <Panel className="mt-10">
      <h2 className="text-2xl">How to stream a service for free</h2>
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-ivory-muted">
        <li>Turn on live streaming in YouTube Studio (free; the first time, YouTube can take up to 24 hours to enable it).</li>
        <li>Install <a className="text-gold underline" href="https://obsproject.com" target="_blank" rel="noreferrer">OBS Studio</a> (free) on the church computer and paste the YouTube stream key into Settings, Stream. You can also stream straight from a phone with the YouTube app.</li>
        <li>To stream to Facebook at the same time, add the free OBS plugin “Multiple RTMP outputs” and paste your Facebook stream key into it.</li>
        <li>Press Start Streaming in OBS, then press Go live on the broadcast above. With your channel ID saved, the website plays the stream even without this step.</li>
        <li>After the service, press End, then add the recording in Sermons so people can watch it again.</li>
      </ol>
      <p className="mt-4 text-xs text-ivory-muted">Never paste a stream key into this website. Stream keys stay in OBS.</p>
    </Panel>
  );
}
