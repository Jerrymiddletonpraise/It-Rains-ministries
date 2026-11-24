import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/roles";
import { AdminHeader, Stat } from "@/components/admin/ui";
import { Notice } from "@/components/ui";
import { enabled } from "@/lib/env";
import { formatMoney } from "@/lib/utils";

export default async function AdminHome({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const { supabase, roles } = await requireUser("/admin");
  const sp = await searchParams;
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const weekAgo = new Date(Date.now() - 7 * 86400_000).toISOString();
  const count = (t: string, f?: (q: any) => any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    let q = supabase.from(t).select("id", { count: "exact", head: true });
    if (f) q = f(q);
    return q.then((r: { count: number | null }) => r.count ?? 0);
  };
  const [prayers, urgent, testimonies, messages, members, regs, views, live, gifts] = await Promise.all([
    can(roles, "prayer") ? count("prayer_requests", (q) => q.eq("status", "new")) : 0,
    can(roles, "prayer") ? count("prayer_requests", (q) => q.eq("status", "new").in("kind", ["urgent", "counseling"])) : 0,
    can(roles, "testimonies") ? count("testimonies", (q) => q.eq("status", "pending")) : 0,
    can(roles, "messages") ? count("contact_messages", (q) => q.eq("status", "new")) : 0,
    count("profiles"),
    can(roles, "events") ? count("event_registrations", (q) => q.gte("created_at", weekAgo)) : 0,
    count("page_views", (q) => q.gte("created_at", weekAgo)),
    supabase.from("streams").select("id,title,status").in("status", ["live", "paused"]).limit(1).maybeSingle(),
    can(roles, "giving") ? supabase.from("donations").select("amount_cents,currency").eq("status", "succeeded").gte("created_at", monthStart) : Promise.resolve({ data: [] }),
  ]);
  const totals = ((gifts as { data: { amount_cents: number; currency: string }[] | null }).data ?? []).reduce<Record<string, number>>((a, g) => ({ ...a, [g.currency]: (a[g.currency] ?? 0) + g.amount_cents }), {});
  const missing = Object.entries({ "Supabase service key": enabled.serviceRole, Stripe: enabled.stripe, PayPal: enabled.paypal, "Email (Resend)": enabled.email, "Live streaming (LiveKit)": enabled.livekit, "Stream recording": enabled.recording }).filter(([, v]) => !v).map(([k]) => k);
  return (
    <>
      <AdminHeader title="Ministry dashboard" intro="Everything happening across IT RAINS MINISTRIES at a glance." />
      {sp.denied && <div className="mb-4"><Notice kind="error">You don&apos;t have permission to open that section.</Notice></div>}
      {missing.length > 0 && roles.includes("super_admin") && <div className="mb-6"><Notice kind="warn">Integrations not yet connected: {missing.join(", ")}. See the README setup list.</Notice></div>}
      {live.data && (
        <Link href={`/admin/live/${live.data.id}`} className="mb-6 flex items-center gap-3 rounded-2xl bg-red-600 p-5 font-semibold text-white"><span className="h-3 w-3 animate-pulse rounded-full bg-white" />{live.data.status === "live" ? "LIVE NOW" : "PAUSED"}: {live.data.title} · open studio →</Link>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {can(roles, "prayer") && <Stat label="New prayer requests" value={prayers} href="/admin/prayer" />}
        {can(roles, "prayer") && <Stat label="Urgent / counseling waiting" value={urgent} tone={urgent ? "red" : "royal"} href="/admin/prayer?kind=urgent" />}
        {can(roles, "testimonies") && <Stat label="Testimonies to review" value={testimonies} href="/admin/testimonies" />}
        {can(roles, "messages") && <Stat label="Unread messages" value={messages} href="/admin/messages" />}
        {can(roles, "giving") && <Stat label="Giving this month" tone="gold" value={Object.keys(totals).length ? Object.entries(totals).map(([c, v]) => formatMoney(v, c)).join(" · ") : formatMoney(0)} href="/admin/giving" />}
        {can(roles, "events") && <Stat label="Event registrations (7 days)" value={regs} href="/admin/events" />}
        <Stat label="Registered members" value={members} href={can(roles, "members") ? "/admin/members" : undefined} />
        <Stat label="Page views (7 days)" value={views.toLocaleString()} href={can(roles, "analytics") ? "/admin/analytics" : undefined} />
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {can(roles, "live") && <Link href="/admin/live" className="rounded-2xl bg-navy-900 p-6 text-white"><p className="font-serif text-2xl">Go live</p><p className="text-sm text-white/70">Start a broadcast from this device or OBS</p></Link>}
        {can(roles, "media") && <Link href="/admin/media/new" className="rounded-2xl bg-royal-700 p-6 text-white"><p className="font-serif text-2xl">Upload a sermon</p><p className="text-sm text-white/70">Video, audio or downloadable resource</p></Link>}
        {can(roles, "announcements") && <Link href="/admin/announcements/new" className="rounded-2xl bg-gold-500 p-6 text-navy-950"><p className="font-serif text-2xl">Post an announcement</p><p className="text-sm text-navy-950/70">Shows on the homepage and member portal</p></Link>}
      </div>
    </>
  );
}
