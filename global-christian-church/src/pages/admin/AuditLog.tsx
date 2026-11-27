import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatDateTime } from "@/lib/utils";

interface Entry { id: number; created_at: string; actor_email: string | null; action: string; table_name: string; record_id: string | null; }

export default function AuditLog() {
  const [rows, setRows] = useState<Entry[]>([]);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    supabase?.from("audit_logs").select("id,created_at,actor_email,action,table_name,record_id").order("created_at", { ascending: false }).limit(100)
      .then(({ data, error }) => { if (error) setErr(error.message); else setRows((data ?? []) as Entry[]); });
  }, []);
  return (
    <div>
      <p className="eyebrow">GCC Control Center</p>
      <h1 className="mt-3 text-4xl">Audit log</h1>
      <p className="mt-2 text-sm text-ivory-muted">The most recent 100 administrative changes. Entries are written by the database and cannot be edited.</p>
      {err && <p className="mt-4 text-sm text-red-300">{err}</p>}
      <div className="mt-6 overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-charcoal text-xs uppercase tracking-[0.14em] text-ivory-muted"><tr><th className="p-4">When</th><th className="p-4">Who</th><th className="p-4">Action</th><th className="p-4">Record</th></tr></thead>
          <tbody>{rows.map((r) => <tr key={r.id} className="border-t border-line"><td className="p-4 text-ivory-muted">{formatDateTime(r.created_at)}</td><td className="p-4">{r.actor_email ?? "system"}</td><td className="p-4"><span className="rounded bg-gold/10 px-2 py-0.5 text-xs text-gold-light">{r.action}</span> {r.table_name}</td><td className="p-4 font-mono text-xs text-ivory-muted">{r.record_id}</td></tr>)}
            {!rows.length && !err && <tr><td colSpan={4} className="p-8 text-center text-ivory-muted">No entries yet.</td></tr>}</tbody>
        </table>
      </div>
    </div>
  );
}
