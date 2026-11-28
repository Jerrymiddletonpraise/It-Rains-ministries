import { useEffect, useState } from "react";
import { Globe2, Lock, Mail, MessageSquarePlus, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/AuthProvider";
import { useAdminTable } from "@/lib/admin";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Select, Textarea } from "@/components/ui/Form";
import { AdminHeader, Empty, Pill, StatusNotice, Tabs } from "@/components/admin/AdminUI";

type PStatus = "new" | "praying" | "follow_up" | "answered" | "closed";
interface Req {
  id: string; name: string | null; email: string | null; phone: string | null; category: string; request: string;
  visibility: "private" | "public"; is_anonymous: boolean; wants_follow_up: boolean; status: PStatus; approved_for_wall: boolean;
  assigned_to: string | null; prayer_count: number; created_at: string;
}
interface Note { id: string; note: string; created_at: string; }
const STATUSES: PStatus[] = ["new", "praying", "follow_up", "answered", "closed"];

export default function PrayerAdmin() {
  const t = useAdminTable<Req>("prayer_requests", { order: "created_at", ascending: false, limit: 300 });
  const [tab, setTab] = useState<PStatus | "open">("open");
  const { user } = useAuth();
  const list = t.rows.filter((r) => (tab === "open" ? r.status !== "closed" && r.status !== "answered" : r.status === tab));
  const count = (s: PStatus) => t.rows.filter((r) => r.status === s).length;

  return (
    <div>
      <AdminHeader title="Prayer requests" intro="Private requests are visible only to the prayer team, pastors and administrators. Public requests appear on the prayer wall only after you approve them." />
      <StatusNotice status={t.status} />
      <Tabs value={tab} onChange={setTab} options={[{ id: "open", label: "Open", count: t.rows.filter((r) => r.status !== "closed" && r.status !== "answered").length }, ...STATUSES.map((s) => ({ id: s, label: s.replace("_", " ").replace(/^\w/, (c) => c.toUpperCase()), count: count(s) }))]} />
      {list.length ? (
        <ul className="grid gap-4 xl:grid-cols-2">
          {list.map((r) => (
            <li key={r.id} className="rounded-2xl border border-line bg-charcoal p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2"><Pill value={r.status} /><span className="text-xs uppercase tracking-[0.14em] text-ivory-muted">{r.category}</span></div>
                <span className="inline-flex items-center gap-1 text-xs text-ivory-muted">{r.visibility === "public" ? <Globe2 className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}{r.visibility}</span>
              </div>
              <p className="mt-3 whitespace-pre-line text-ivory">{r.request}</p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ivory-muted">
                <span>{r.is_anonymous ? "Anonymous" : r.name ?? "No name"}</span><span>{formatDateTime(r.created_at)}</span>
                {r.email && <a className="inline-flex items-center gap-1 hover:text-gold" href={`mailto:${r.email}`}><Mail className="h-3 w-3" />{r.email}</a>}
                {r.phone && <a className="inline-flex items-center gap-1 hover:text-gold" href={`tel:${r.phone}`}><Phone className="h-3 w-3" />{r.phone}</a>}
                {r.wants_follow_up && <span className="text-amber-200">Wants follow-up</span>}
                {r.prayer_count > 0 && <span>{r.prayer_count} prayed</span>}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <label className="sr-only" htmlFor={`st-${r.id}`}>Status</label>
                <Select id={`st-${r.id}`} className="h-9 w-auto py-1" value={r.status} onChange={(e) => t.save({ id: r.id, status: e.target.value as PStatus }, "Status updated.")}>{STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}</Select>
                {r.visibility === "public" && <Button size="sm" variant={r.approved_for_wall ? "ghost" : "outline"} onClick={() => t.save({ id: r.id, approved_for_wall: !r.approved_for_wall }, r.approved_for_wall ? "Removed from the prayer wall." : "Approved. It now shows on the prayer wall.")}>{r.approved_for_wall ? "Remove from wall" : "Approve for wall"}</Button>}
                {user && r.assigned_to !== user.id && <Button size="sm" variant="ghost" onClick={() => t.save({ id: r.id, assigned_to: user.id, status: r.status === "new" ? "praying" : r.status }, "Assigned to you.")}>I'll pray for this</Button>}
              </div>
              <Notes requestId={r.id} />
            </li>
          ))}
        </ul>
      ) : <Empty>{t.loading ? "Loading…" : "No prayer requests in this list."}</Empty>}
    </div>
  );
}

function Notes({ requestId }: { requestId: string }) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [text, setText] = useState("");
  useEffect(() => {
    if (!open || !supabase) return;
    supabase.from("prayer_notes").select("id,note,created_at").eq("prayer_request_id", requestId).order("created_at").then(({ data }) => setNotes((data ?? []) as Note[]));
  }, [open, requestId]);
  async function add() {
    if (!supabase || !text.trim()) return;
    const { data, error } = await supabase.from("prayer_notes").insert({ prayer_request_id: requestId, note: text.trim() }).select("id,note,created_at").single();
    if (!error && data) { setNotes((n) => [...n, data as Note]); setText(""); }
  }
  if (!open) return <button className="mt-4 inline-flex items-center gap-1 text-xs text-gold hover:underline" onClick={() => setOpen(true)}><MessageSquarePlus className="h-3.5 w-3.5" />Team notes</button>;
  return (
    <div className="mt-4 rounded-xl border border-line p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ivory-muted">Team notes (never shown to the requester)</p>
      <ul className="mt-2 space-y-2 text-sm">{notes.map((n) => <li key={n.id}><span className="text-xs text-ivory-muted">{formatDateTime(n.created_at)}</span><br />{n.note}</li>)}</ul>
      <div className="mt-3 flex gap-2"><Textarea aria-label="New note" className="min-h-[44px]" rows={1} value={text} onChange={(e) => setText(e.target.value)} /><Button size="sm" onClick={add}>Add</Button></div>
    </div>
  );
}
