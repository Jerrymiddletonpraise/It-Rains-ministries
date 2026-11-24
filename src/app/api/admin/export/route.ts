import { getSession } from "@/lib/auth";
import { can } from "@/lib/roles";

const csv = (rows: Record<string, unknown>[]) => {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]);
  const cell = (v: unknown) => { const s = v === null || v === undefined ? "" : Array.isArray(v) ? v.join("; ") : String(v); return /[",\n]/.test(s) || /^[=+\-@]/.test(s) ? `"${s.replace(/"/g, '""').replace(/^([=+\-@])/, "'$1")}"` : s; };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => cell(r[c])).join(","))].join("\n");
};

/** CSV exports for finance, events and newsletter. Permissions enforced by role check + RLS. */
export async function GET(req: Request) {
  const { user, roles, supabase } = await getSession();
  if (!user || !supabase) return new Response("Unauthorized", { status: 401 });
  const url = new URL(req.url);
  const type = url.searchParams.get("type");
  let rows: Record<string, unknown>[] = [];
  if (type === "donations" && can(roles, "giving")) {
    const { data } = await supabase.from("donations").select("receipt_number,created_at,donor_name,donor_email,fund,frequency,amount_cents,currency,provider,provider_ref,status,note").order("created_at", { ascending: false }).limit(10000);
    rows = (data ?? []).map((d) => ({ ...d, amount: (d.amount_cents / 100).toFixed(2), amount_cents: undefined }));
  } else if (type === "registrations" && can(roles, "events")) {
    const { data } = await supabase.from("event_registrations").select("created_at,name,email,phone,guests,status,notes").eq("event_id", url.searchParams.get("event") ?? "").order("created_at");
    rows = data ?? [];
  } else if (type === "subscribers" && can(roles, "newsletter")) {
    const { data } = await supabase.from("newsletter_subscribers").select("email,name,subscribed,created_at").order("created_at");
    rows = data ?? [];
  } else return new Response("Forbidden", { status: 403 });
  rows = rows.map((r) => Object.fromEntries(Object.entries(r).filter(([, v]) => v !== undefined)));
  return new Response(csv(rows), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${type}-${new Date().toISOString().slice(0, 10)}.csv"` } });
}
