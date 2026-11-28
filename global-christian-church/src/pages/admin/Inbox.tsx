import { useState } from "react";
import { Mail, Phone, Reply, Trash2 } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { hasAnyRole } from "@/auth/roles";
import { fromLocalInput, toLocalInput, useAdminTable } from "@/lib/admin";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Form";
import { AdminHeader, Empty, Pill, StatusNotice, Tabs } from "@/components/admin/AdminUI";

interface Msg { id: string; name: string; email: string; phone: string | null; topic: string; message: string; status: "new" | "replied" | "closed"; created_at: string; }
interface Care { id: string; name: string; email: string; phone: string | null; request_type: string; preferred_times: string | null; details: string | null; status: string; scheduled_for: string | null; created_at: string; }
const CARE_STATUSES = ["new", "assigned", "scheduled", "completed", "closed"];

export default function Inbox() {
  const [tab, setTab] = useState<"messages" | "care">("messages");
  const msgs = useAdminTable<Msg>("contact_messages", { order: "created_at", ascending: false, limit: 300 });
  const care = useAdminTable<Care>("pastoral_care_requests", { order: "created_at", ascending: false, limit: 300 });
  const { roles } = useAuth();
  const isAdmin = hasAnyRole(roles, ["super_admin", "church_admin"]);

  return (
    <div>
      <AdminHeader title="Inbox" intro="Messages from the Contact page and pastoral care requests. Reply by email, then mark them as replied." />
      <Tabs value={tab} onChange={setTab} options={[{ id: "messages", label: "Contact messages", count: msgs.rows.filter((m) => m.status === "new").length }, { id: "care", label: "Pastoral care", count: care.rows.filter((c) => c.status === "new").length }]} />
      {tab === "messages" ? (
        <>
          <StatusNotice status={msgs.status} />
          {msgs.rows.length ? (
            <ul className="space-y-3">{msgs.rows.map((m) => (
              <li key={m.id} className="rounded-2xl border border-line bg-charcoal p-5">
                <div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><Pill value={m.status} /><p className="font-semibold">{m.name}</p><span className="text-xs text-ivory-muted">· {m.topic}</span></div><span className="text-xs text-ivory-muted">{formatDateTime(m.created_at)}</span></div>
                <p className="mt-3 whitespace-pre-line text-ivory-muted">{m.message}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <a href={`mailto:${m.email}?subject=${encodeURIComponent("Re: your message to Global Christian Church")}`} onClick={() => m.status === "new" && msgs.save({ id: m.id, status: "replied" }, "Marked as replied.")} className="inline-flex h-9 items-center gap-2 rounded-full border border-gold/60 px-4 text-xs font-semibold text-gold-light hover:bg-gold/10"><Reply className="h-3.5 w-3.5" />Reply by email</a>
                  {m.phone && <a href={`tel:${m.phone}`} className="inline-flex h-9 items-center gap-2 rounded-full px-3 text-xs text-ivory-muted hover:text-ivory"><Phone className="h-3.5 w-3.5" />{m.phone}</a>}
                  <span className="inline-flex items-center gap-1 text-xs text-ivory-muted"><Mail className="h-3.5 w-3.5" />{m.email}</span>
                  <label className="sr-only" htmlFor={`m-${m.id}`}>Status</label>
                  <Select id={`m-${m.id}`} className="ml-auto h-9 w-auto py-1" value={m.status} onChange={(e) => msgs.save({ id: m.id, status: e.target.value as Msg["status"] }, "Status updated.")}><option value="new">new</option><option value="replied">replied</option><option value="closed">closed</option></Select>
                  {isAdmin && <Button size="sm" variant="ghost" aria-label="Delete message" onClick={() => confirm("Delete this message?") && msgs.remove(m.id, "Message deleted.")}><Trash2 className="h-4 w-4" /></Button>}
                </div>
              </li>
            ))}</ul>
          ) : <Empty>{msgs.loading ? "Loading…" : "No messages yet. Messages sent from the Contact page arrive here."}</Empty>}
        </>
      ) : (
        <>
          <StatusNotice status={care.status} />
          {care.rows.length ? (
            <ul className="space-y-3">{care.rows.map((c) => (
              <li key={c.id} className="rounded-2xl border border-line bg-charcoal p-5">
                <div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><Pill value={c.status} /><p className="font-semibold">{c.name}</p><span className="text-xs text-ivory-muted">· {c.request_type.replace("_", " ")}</span></div><span className="text-xs text-ivory-muted">{formatDateTime(c.created_at)}</span></div>
                {c.details && <p className="mt-3 whitespace-pre-line text-ivory-muted">{c.details}</p>}
                {c.preferred_times && <p className="mt-2 text-xs text-ivory-muted">Preferred times: {c.preferred_times}</p>}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <a href={`mailto:${c.email}`} className="inline-flex h-9 items-center gap-2 rounded-full border border-gold/60 px-4 text-xs font-semibold text-gold-light hover:bg-gold/10"><Reply className="h-3.5 w-3.5" />Email {c.name.split(" ")[0]}</a>
                  {c.phone && <a href={`tel:${c.phone}`} className="inline-flex h-9 items-center gap-2 rounded-full px-3 text-xs text-ivory-muted hover:text-ivory"><Phone className="h-3.5 w-3.5" />{c.phone}</a>}
                  <label className="sr-only" htmlFor={`c-when-${c.id}`}>Appointment</label>
                  <Input id={`c-when-${c.id}`} type="datetime-local" className="h-9 w-auto py-1" defaultValue={toLocalInput(c.scheduled_for)} onBlur={(e) => e.target.value !== toLocalInput(c.scheduled_for) && care.save({ id: c.id, scheduled_for: fromLocalInput(e.target.value), status: e.target.value ? "scheduled" : c.status }, "Appointment saved.")} />
                  <label className="sr-only" htmlFor={`c-${c.id}`}>Status</label>
                  <Select id={`c-${c.id}`} className="ml-auto h-9 w-auto py-1" value={c.status} onChange={(e) => care.save({ id: c.id, status: e.target.value }, "Status updated.")}>{CARE_STATUSES.map((s) => <option key={s}>{s}</option>)}</Select>
                </div>
              </li>
            ))}</ul>
          ) : <Empty>{care.loading ? "Loading…" : "No pastoral care requests yet."}</Empty>}
        </>
      )}
    </div>
  );
}
