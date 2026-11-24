import { Download } from "lucide-react";
import { requireArea } from "@/lib/auth";
import { AdminHeader, Stat, tableCls, tdCls, thCls } from "@/components/admin/ui";
import { NewsletterComposer, PushComposer } from "@/components/admin/NewsletterComposer";
import { Notice } from "@/components/ui";
import { enabled } from "@/lib/env";
import { formatDateTime } from "@/lib/utils";

export default async function NewsletterAdmin() {
  const { supabase } = await requireArea("newsletter");
  const [{ count: subs }, { count: members }, { data: history }, { count: devices }] = await Promise.all([
    supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true }).eq("subscribed", true),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("newsletter_opt_in", true),
    supabase.from("newsletters").select("*").order("created_at", { ascending: false }).limit(20),
    supabase.from("push_subscriptions").select("id", { count: "exact", head: true }),
  ]);
  return (
    <>
      <AdminHeader title="Newsletter & notifications" action={<a href="/api/admin/export?type=subscribers" className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white"><Download className="h-4 w-4" />Export subscribers</a>} />
      {!enabled.email && <div className="mb-6"><Notice kind="warn">Email isn&apos;t connected. Add RESEND_API_KEY and EMAIL_FROM to send newsletters.</Notice></div>}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Newsletter subscribers" value={subs ?? 0} /><Stat label="Members opted in" value={members ?? 0} /><Stat label="Devices with push notifications" value={devices ?? 0} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[3fr_2fr]">
        <div className="rounded-2xl bg-white p-6 shadow-sm"><h2 className="mb-4 font-serif text-2xl font-bold">Compose newsletter</h2><NewsletterComposer /></div>
        <div className="h-max rounded-2xl bg-white p-6 shadow-sm"><h2 className="mb-4 font-serif text-2xl font-bold">Push notification</h2><PushComposer /></div>
      </div>
      <h2 className="mb-3 mt-10 font-serif text-2xl font-bold">Sent newsletters</h2>
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className={tableCls}><thead><tr>{["Subject", "Audience", "Recipients", "Sent"].map((h) => <th key={h} className={thCls}>{h}</th>)}</tr></thead>
          <tbody>{(history ?? []).map((n) => <tr key={n.id}><td className={tdCls}>{n.subject}</td><td className={`${tdCls} capitalize`}>{n.audience}</td><td className={tdCls}>{n.sent_count}</td><td className={tdCls}>{n.sent_at && formatDateTime(n.sent_at)}</td></tr>)}</tbody>
        </table>
      </div>
    </>
  );
}
