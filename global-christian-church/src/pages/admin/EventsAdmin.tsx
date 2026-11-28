import { useEffect, useState, type FormEvent } from "react";
import { CalendarPlus, Pencil, Trash2, Users, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fromLocalInput, toLocalInput, useAdminTable } from "@/lib/admin";
import type { ChurchEvent, Ministry } from "@/lib/types";
import { formatDateTime, slugify } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/Form";
import { AdminHeader, Empty, Panel, Pill, StatusNotice, Tabs } from "@/components/admin/AdminUI";

type Row = ChurchEvent & { status: "draft" | "published" | "archived" };
const REPEAT: Record<string, string> = { "": "Does not repeat", "FREQ=WEEKLY;BYDAY=SU": "Every Sunday", "FREQ=WEEKLY;BYDAY=WE": "Every Wednesday", "FREQ=WEEKLY;BYDAY=FR": "Every Friday", "FREQ=WEEKLY": "Every week", "FREQ=MONTHLY": "Every month" };
const blank = (): Partial<Row> => ({ title: "", slug: "", description: "", starts_at: "", ends_at: null, location: "", online_url: "", ministry_id: null, registration_required: false, capacity: null, is_recurring: false, recurrence_rule: null, status: "published" });

export default function EventsAdmin() {
  const t = useAdminTable<Row>("events", { order: "starts_at", ascending: true, limit: 300 });
  const [form, setForm] = useState<Partial<Row> | null>(null);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [ministries, setMinistries] = useState<Pick<Ministry, "id" | "name">[]>([]);
  const [regs, setRegs] = useState<Record<string, number>>({});
  useEffect(() => {
    supabase?.from("ministries").select("id,name").order("sort_order").then(({ data }) => setMinistries((data ?? []) as Ministry[]));
    supabase?.from("event_registrations").select("event_id,status").then(({ data }) => {
      const c: Record<string, number> = {}; (data ?? []).forEach((r: { event_id: string; status: string }) => { if (r.status === "registered") c[r.event_id] = (c[r.event_id] ?? 0) + 1; }); setRegs(c);
    });
  }, []);
  const set = (k: keyof Row, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
  const now = Date.now();
  const list = t.rows.filter((e) => (tab === "upcoming" ? new Date(e.ends_at ?? e.starts_at).getTime() >= now - 6 * 3600_000 || e.is_recurring : new Date(e.ends_at ?? e.starts_at).getTime() < now - 6 * 3600_000 && !e.is_recurring));

  async function submit(e: FormEvent) {
    e.preventDefault(); if (!form) return;
    const nul = (v?: string | null) => (v && v.trim() ? v.trim() : null);
    const row: Partial<Row> = { ...form, slug: nul(form.slug) ?? slugify(`${form.title}-${(form.starts_at ?? "").slice(0, 10)}`), description: nul(form.description), location: nul(form.location), online_url: nul(form.online_url), is_recurring: Boolean(form.recurrence_rule), recurrence_rule: nul(form.recurrence_rule) };
    if (await t.save(row, row.status === "published" ? "Event saved and published on the calendar." : "Event saved as a draft.")) setForm(null);
  }

  return (
    <div>
      <AdminHeader title="Events" intro="Services, gatherings and special events shown on the website calendar." action={!form && <Button onClick={() => setForm(blank())}><CalendarPlus className="h-4 w-4" />Add an event</Button>} />
      <StatusNotice status={t.status} />
      {form && (
        <Panel className="mb-8">
          <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
            <div className="flex items-center justify-between sm:col-span-2"><h2 className="text-2xl">{form.id ? "Edit event" : "Add an event"}</h2><button type="button" onClick={() => setForm(null)} aria-label="Close" className="text-ivory-muted hover:text-ivory"><X className="h-5 w-5" /></button></div>
            <Field label="Title" htmlFor="e-title" required className="sm:col-span-2"><Input id="e-title" required value={form.title ?? ""} onChange={(e) => set("title", e.target.value)} /></Field>
            <Field label="Starts" htmlFor="e-start" required><Input id="e-start" type="datetime-local" required value={toLocalInput(form.starts_at)} onChange={(e) => set("starts_at", fromLocalInput(e.target.value))} /></Field>
            <Field label="Ends" htmlFor="e-end"><Input id="e-end" type="datetime-local" value={toLocalInput(form.ends_at)} onChange={(e) => set("ends_at", fromLocalInput(e.target.value))} /></Field>
            <Field label="Repeats" htmlFor="e-rep"><Select id="e-rep" value={form.recurrence_rule ?? ""} onChange={(e) => set("recurrence_rule", e.target.value || null)}>{Object.entries(REPEAT).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</Select></Field>
            <Field label="Ministry" htmlFor="e-min"><Select id="e-min" value={form.ministry_id ?? ""} onChange={(e) => set("ministry_id", e.target.value || null)}><option value="">Whole church</option>{ministries.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</Select></Field>
            <Field label="Location" htmlFor="e-loc"><Input id="e-loc" value={form.location ?? ""} onChange={(e) => set("location", e.target.value)} placeholder="Online, or an address" /></Field>
            <Field label="Online link" htmlFor="e-url" hint="e.g. the Watch Live page or a free video room link"><Input id="e-url" type="url" value={form.online_url ?? ""} onChange={(e) => set("online_url", e.target.value)} /></Field>
            <Field label="Description" htmlFor="e-desc" className="sm:col-span-2"><Textarea id="e-desc" rows={4} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} /></Field>
            <div className="space-y-3"><Checkbox id="e-reg" label="People register to attend" checked={form.registration_required ?? false} onChange={(e) => set("registration_required", e.target.checked)} /></div>
            {form.registration_required && <Field label="Capacity" htmlFor="e-cap" hint="Extra people go on a waitlist automatically."><Input id="e-cap" type="number" min={1} value={form.capacity ?? ""} onChange={(e) => set("capacity", e.target.value ? Number(e.target.value) : null)} /></Field>}
            <Field label="Status" htmlFor="e-status"><Select id="e-status" value={form.status} onChange={(e) => set("status", e.target.value)}><option value="published">Published</option><option value="draft">Draft</option><option value="archived">Archived</option></Select></Field>
            <div className="flex gap-3 sm:col-span-2"><Button type="submit">{form.id ? "Save changes" : "Add event"}</Button><Button type="button" variant="ghost" onClick={() => setForm(null)}>Cancel</Button></div>
          </form>
        </Panel>
      )}
      <Tabs value={tab} onChange={setTab} options={[{ id: "upcoming", label: "Upcoming and repeating" }, { id: "past", label: "Past" }]} />
      {list.length ? (
        <ul className="space-y-3">{list.map((e) => (
          <li key={e.id} className="flex flex-col gap-3 rounded-2xl border border-line bg-charcoal p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0"><div className="flex items-center gap-2"><Pill value={e.status} /><p className="truncate font-semibold">{e.title}</p></div>
              <p className="mt-1 text-xs text-ivory-muted">{formatDateTime(e.starts_at)}{e.recurrence_rule ? ` · ${REPEAT[e.recurrence_rule] ?? "Repeats"}` : ""}{e.location ? ` · ${e.location}` : ""}</p></div>
            <div className="flex shrink-0 items-center gap-1">
              {e.registration_required && <span className="mr-2 inline-flex items-center gap-1 text-xs text-ivory-muted"><Users className="h-3.5 w-3.5" />{regs[e.id] ?? 0}{e.capacity ? ` / ${e.capacity}` : ""}</span>}
              <Button size="sm" variant="ghost" onClick={() => setForm(e)} aria-label={`Edit ${e.title}`}><Pencil className="h-4 w-4" /></Button>
              <Button size="sm" variant="ghost" onClick={() => confirm(`Delete “${e.title}”?`) && t.remove(e.id, "Event deleted.")} aria-label={`Delete ${e.title}`}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </li>
        ))}</ul>
      ) : <Empty>{t.loading ? "Loading…" : "No events here yet."}</Empty>}
    </div>
  );
}
