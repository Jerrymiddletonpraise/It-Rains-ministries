import { useState, type FormEvent } from "react";
import { Search, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/AuthProvider";
import { ROLES, ROLE_LABELS, type AppRole } from "@/auth/roles";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Form";
import { Notice } from "@/components/ui/Misc";

interface Row { id: string; full_name: string | null; email: string | null; user_roles: { role: AppRole }[] }

export default function RolesManager() {
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  async function search(e?: FormEvent) {
    e?.preventDefault(); if (!supabase) return;
    const term = q.trim().replace(/[%,()]/g, "");
    let query = supabase.from("profiles").select("id,full_name,email,user_roles(role)").order("created_at", { ascending: false }).limit(25);
    if (term) query = query.or(`email.ilike.%${term}%,full_name.ilike.%${term}%`);
    const { data, error } = await query;
    if (error) setMsg({ tone: "error", text: error.message }); else setRows((data ?? []) as Row[]);
  }

  async function grant(uid: string, role: AppRole) {
    const { error } = await supabase!.from("user_roles").insert({ user_id: uid, role });
    setMsg(error ? { tone: "error", text: error.message } : { tone: "success", text: `${ROLE_LABELS[role]} granted.` }); await search();
  }
  async function revoke(uid: string, role: AppRole) {
    const { error } = await supabase!.from("user_roles").delete().eq("user_id", uid).eq("role", role);
    setMsg(error ? { tone: "error", text: error.message } : { tone: "success", text: `${ROLE_LABELS[role]} removed.` }); await search();
  }

  return (
    <div>
      <p className="eyebrow">GCC Control Center</p>
      <h1 className="mt-3 text-4xl">Roles and access</h1>
      <p className="mt-2 max-w-2xl text-sm text-ivory-muted">Only Super Administrators can change roles. Every change is written to the audit log, and the database refuses to remove the last Super Administrator.</p>
      <form onSubmit={search} className="mt-6 flex max-w-xl gap-3">
        <label className="relative flex-1"><span className="sr-only">Search people</span><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ivory-muted" aria-hidden /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or email" className="pl-11" /></label>
        <Button type="submit">Search</Button>
      </form>
      {msg && <Notice tone={msg.tone} className="mt-4 max-w-xl">{msg.text}</Notice>}
      <div className="mt-8 overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-charcoal text-xs uppercase tracking-[0.14em] text-ivory-muted"><tr><th className="p-4">Person</th><th className="p-4">Roles</th><th className="p-4">Grant role</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-line align-top">
                <td className="p-4"><p className="font-semibold">{r.full_name ?? "No name"}</p><p className="text-xs text-ivory-muted">{r.email}</p></td>
                <td className="p-4"><div className="flex flex-wrap gap-2">{r.user_roles.map(({ role }) => (
                  <span key={role} className="inline-flex items-center gap-1 rounded-full border border-gold/40 px-2.5 py-1 text-xs text-gold-light">{ROLE_LABELS[role]}
                    {!(r.id === user?.id && role === "super_admin") && <button type="button" aria-label={`Remove ${ROLE_LABELS[role]}`} onClick={() => revoke(r.id, role)}><X className="h-3 w-3" /></button>}
                  </span>
                ))}</div></td>
                <td className="p-4">
                  <Select aria-label={`Grant a role to ${r.full_name ?? r.email}`} defaultValue="" onChange={(e) => { if (e.target.value) { void grant(r.id, e.target.value as AppRole); e.target.value = ""; } }} className="py-2">
                    <option value="">Choose role…</option>{ROLES.filter((x) => !r.user_roles.some((u) => u.role === x)).map((x) => <option key={x} value={x}>{ROLE_LABELS[x]}</option>)}
                  </Select>
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={3} className="p-8 text-center text-ivory-muted">Search to list accounts.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
