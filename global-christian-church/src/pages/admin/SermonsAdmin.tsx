import { useState, type FormEvent } from "react";
import { BookOpen, ExternalLink, Pencil, Star, Trash2, X } from "lucide-react";
import { fromLocalInput, toLocalInput, useAdminTable, youtubeThumb } from "@/lib/admin";
import type { MediaKind, Sermon } from "@/lib/types";
import { formatDate, slugify, toEmbedUrl } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/Form";
import { AdminHeader, Empty, Panel, Pill, StatusNotice, Tabs } from "@/components/admin/AdminUI";
import { sermonKindLabel } from "@/components/Cards";
import { FOUNDER_NAME } from "@/lib/founder";

type Row = Sermon & { status: "draft" | "published" | "archived" };
const KINDS: MediaKind[] = ["video_sermon", "audio_sermon", "bible_teaching", "worship", "conference", "podcast"];
const blank = (): Partial<Row> => ({ title: "", slug: "", kind: "video_sermon", speaker: FOUNDER_NAME, scripture_reference: "", series: "", category: "", description: "", video_url: "", audio_url: "", thumbnail_url: "", preached_on: new Date().toISOString(), duration_minutes: null, is_featured: false, status: "published" });

export default function SermonsAdmin() {
  const t = useAdminTable<Row>("sermons", { order: "preached_on", ascending: false });
  const [form, setForm] = useState<Partial<Row> | null>(null);
  const [tab, setTab] = useState<"all" | "published" | "draft">("all");
  const set = (k: keyof Row, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
  const list = t.rows.filter((r) => tab === "all" || r.status === tab);

  async function submit(e: FormEvent) {
    e.preventDefault(); if (!form) return;
    if (form.video_url && !toEmbedUrl(form.video_url) && !/\.(mp4|webm|m3u8)(\?|$)/i.test(form.video_url)) {
      t.setStatus({ tone: "error", msg: "Paste a YouTube or Facebook video link, or a direct .mp4 link." }); return;
    }
    const nul = (v?: string | null) => (v && v.trim() ? v.trim() : null);
    const row: Partial<Row> = {
      ...form, slug: nul(form.slug) ?? slugify(`${form.title}-${(form.preached_on ?? "").slice(0, 10)}`),
      speaker: nul(form.speaker), scripture_reference: nul(form.scripture_reference), series: nul(form.series), category: nul(form.category),
      description: nul(form.description), video_url: nul(form.video_url), audio_url: nul(form.audio_url),
      thumbnail_url: nul(form.thumbnail_url) ?? youtubeThumb(form.video_url),
    };
    if (await t.save(row, row.status === "published" ? "Sermon saved and published. It is now in the free sermon library." : "Sermon saved as a draft.")) setForm(null);
  }

  return (
    <div>
      <AdminHeader title="Sermons" intro="Add recordings to the free sermon library. Paste a YouTube link and the artwork is filled in for you." action={!form && <Button onClick={() => setForm(blank())}><BookOpen className="h-4 w-4" />Add a sermon</Button>} />
      <StatusNotice status={t.status} />

      {form && (
        <Panel className="mb-8">
          <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
            <div className="flex items-center justify-between sm:col-span-2"><h2 className="text-2xl">{form.id ? "Edit sermon" : "Add a sermon"}</h2><button type="button" onClick={() => setForm(null)} aria-label="Close" className="text-ivory-muted hover:text-ivory"><X className="h-5 w-5" /></button></div>
            <Field label="Title" htmlFor="s-title" required className="sm:col-span-2"><Input id="s-title" required value={form.title ?? ""} onChange={(e) => set("title", e.target.value)} /></Field>
            <Field label="Video link" htmlFor="s-video" className="sm:col-span-2" hint="YouTube or Facebook link, or a direct .mp4 file link."><Input id="s-video" type="url" value={form.video_url ?? ""} onChange={(e) => set("video_url", e.target.value)} placeholder="https://www.youtube.com/watch?v=..." /></Field>
            <Field label="Speaker" htmlFor="s-speaker"><Input id="s-speaker" value={form.speaker ?? ""} onChange={(e) => set("speaker", e.target.value)} /></Field>
            <Field label="Date preached" htmlFor="s-date"><Input id="s-date" type="datetime-local" value={toLocalInput(form.preached_on)} onChange={(e) => set("preached_on", fromLocalInput(e.target.value))} /></Field>
            <Field label="Type" htmlFor="s-kind"><Select id="s-kind" value={form.kind} onChange={(e) => set("kind", e.target.value)}>{KINDS.map((k) => <option key={k} value={k}>{sermonKindLabel(k)}</option>)}</Select></Field>
            <Field label="Scripture" htmlFor="s-ref"><Input id="s-ref" value={form.scripture_reference ?? ""} onChange={(e) => set("scripture_reference", e.target.value)} placeholder="John 3:16" /></Field>
            <Field label="Series" htmlFor="s-series"><Input id="s-series" value={form.series ?? ""} onChange={(e) => set("series", e.target.value)} /></Field>
            <Field label="Category" htmlFor="s-cat"><Input id="s-cat" value={form.category ?? ""} onChange={(e) => set("category", e.target.value)} placeholder="Healing, Identity, Faith…" /></Field>
            <Field label="Description" htmlFor="s-desc" className="sm:col-span-2"><Textarea id="s-desc" rows={4} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} /></Field>
            <Field label="Audio link (optional)" htmlFor="s-audio"><Input id="s-audio" type="url" value={form.audio_url ?? ""} onChange={(e) => set("audio_url", e.target.value)} /></Field>
            <Field label="Artwork link (optional)" htmlFor="s-thumb" hint="Left empty, the YouTube thumbnail is used."><Input id="s-thumb" type="url" value={form.thumbnail_url ?? ""} onChange={(e) => set("thumbnail_url", e.target.value)} /></Field>
            <Field label="Length in minutes" htmlFor="s-dur"><Input id="s-dur" type="number" min={1} value={form.duration_minutes ?? ""} onChange={(e) => set("duration_minutes", e.target.value ? Number(e.target.value) : null)} /></Field>
            <Field label="Status" htmlFor="s-status"><Select id="s-status" value={form.status} onChange={(e) => set("status", e.target.value)}><option value="published">Published (visible to everyone)</option><option value="draft">Draft (staff only)</option><option value="archived">Archived</option></Select></Field>
            <div className="sm:col-span-2"><Checkbox id="s-feat" label="Feature on the homepage" checked={form.is_featured ?? false} onChange={(e) => set("is_featured", e.target.checked)} /></div>
            <div className="flex gap-3 sm:col-span-2"><Button type="submit">{form.id ? "Save changes" : "Add sermon"}</Button><Button type="button" variant="ghost" onClick={() => setForm(null)}>Cancel</Button></div>
          </form>
        </Panel>
      )}

      <Tabs value={tab} onChange={setTab} options={[{ id: "all", label: "All", count: t.rows.length }, { id: "published", label: "Published", count: t.rows.filter((r) => r.status === "published").length }, { id: "draft", label: "Drafts", count: t.rows.filter((r) => r.status === "draft").length }]} />
      {list.length ? (
        <ul className="grid gap-3">
          {list.map((s) => (
            <li key={s.id} className="flex flex-col gap-3 rounded-2xl border border-line bg-charcoal p-3 sm:flex-row sm:items-center">
              <div className="aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-ink sm:w-40">{s.thumbnail_url && <img src={s.thumbnail_url} alt="" className="h-full w-full object-cover" loading="lazy" />}</div>
              <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><Pill value={s.status} />{s.is_featured && <Star className="h-4 w-4 text-gold" aria-label="Featured" />}<p className="truncate font-semibold">{s.title}</p></div>
                <p className="mt-1 text-xs text-ivory-muted">{[s.speaker, s.preached_on && formatDate(s.preached_on), s.scripture_reference].filter(Boolean).join(" · ")}</p></div>
              <div className="flex shrink-0 gap-1">
                {s.status === "published" && <a href={`/sermons/${s.slug}`} target="_blank" rel="noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ivory-muted hover:text-ivory" aria-label="View on website"><ExternalLink className="h-4 w-4" /></a>}
                <Button size="sm" variant="ghost" onClick={() => setForm(s)} aria-label={`Edit ${s.title}`}><Pencil className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => confirm(`Delete “${s.title}”? This cannot be undone.`) && t.remove(s.id, "Sermon deleted.")} aria-label={`Delete ${s.title}`}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </li>
          ))}
        </ul>
      ) : <Empty>{t.loading ? "Loading…" : "No sermons here yet. Add your first recording and it appears in the free sermon library."}</Empty>}
    </div>
  );
}
