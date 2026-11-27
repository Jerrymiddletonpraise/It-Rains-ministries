import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/AuthProvider";
import { ROLE_LABELS } from "@/auth/roles";

const METRICS = [
  { table: "profiles", label: "Registered accounts" }, { table: "membership_applications", label: "Membership applications" },
  { table: "visitor_cards", label: "Visitor cards" }, { table: "prayer_requests", label: "Prayer requests" },
  { table: "volunteer_applications", label: "Volunteer applications" }, { table: "newsletter_subscriptions", label: "Newsletter subscribers" },
  { table: "contact_messages", label: "Contact messages" }, { table: "event_registrations", label: "Event registrations" },
];

export default function Overview() {
  const { roles } = useAuth();
  const [counts, setCounts] = useState<Record<string, number | null>>({});
  useEffect(() => {
    if (!supabase) return;
    METRICS.forEach(({ table }) => {
      supabase!.from(table).select("*", { count: "exact", head: true }).then(({ count, error }) => setCounts((c) => ({ ...c, [table]: error ? null : count ?? 0 })));
    });
  }, []);
  return (
    <div>
      <p className="eyebrow">GCC Control Center</p>
      <h1 className="mt-3 text-4xl">Overview</h1>
      <p className="mt-2 text-sm text-ivory-muted">Signed in as {roles.map((r) => ROLE_LABELS[r]).join(", ")}. Figures show only records your role is allowed to see.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {METRICS.map((m) => (
          <div key={m.table} className="rounded-2xl border border-line bg-charcoal p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ivory-muted">{m.label}</p>
            <p className="mt-3 font-display text-5xl">{counts[m.table] === undefined ? "…" : counts[m.table] === null ? "n/a" : counts[m.table]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
