import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth";
import { receiptKey } from "@/lib/giving";
import { enabled } from "@/lib/env";
import { formatDate, formatMoney, FUNDS } from "@/lib/utils";
import { LogoMark } from "@/components/ui/Logo";
import { PrintButton } from "@/components/give/PrintButton";
import { can } from "@/lib/roles";

export const dynamic = "force-dynamic";
export const metadata = { title: "Donation receipt", robots: { index: false } };

export default async function Receipt({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ k?: string }> }) {
  const [{ id }, { k }] = await Promise.all([params, searchParams]);
  if (!enabled.serviceRole || !/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { data: d } = await createAdminClient().from("donations").select("*").eq("id", id).maybeSingle();
  if (!d) notFound();
  const { user, roles } = await getSession();
  const allowed = k === receiptKey(id) || (user && (d.user_id === user.id || can(roles, "giving")));
  if (!allowed) notFound();
  return (
    <div className="min-h-screen bg-ivory px-4 pb-16 pt-28 print:p-0">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-10 shadow print:shadow-none">
        <div className="flex items-center justify-between border-b border-navy-900/10 pb-6">
          <div className="flex items-center gap-3"><LogoMark className="h-14 w-14" /><div><p className="font-serif text-2xl font-bold tracking-widest">IT RAINS MINISTRIES</p><p className="text-xs text-navy-800/60">Official donation receipt</p></div></div>
          <PrintButton />
        </div>
        <dl className="mt-6 divide-y divide-navy-900/10">
          {[
            ["Receipt number", d.receipt_number], ["Date", formatDate(d.created_at, { dateStyle: "long" })], ["Received from", d.donor_name || d.donor_email || "Anonymous"],
            ["Email", d.donor_email ?? ""], ["Fund", FUNDS[d.fund]?.label ?? d.fund], ["Frequency", d.frequency === "monthly" ? "Monthly" : "One-time"],
            ["Amount", formatMoney(d.amount_cents, d.currency)], ["Payment", d.provider === "stripe" ? "Card / wallet via Stripe" : "PayPal"], ["Transaction reference", d.provider_ref],
            ["Status", d.status === "refunded" ? "Refunded" : "Received"],
          ].map(([a, b]) => <div key={a} className="flex justify-between gap-6 py-3 text-sm"><dt className="text-navy-800/60">{a}</dt><dd className="text-right font-semibold">{b}</dd></div>)}
        </dl>
        <p className="mt-8 text-sm text-navy-800/70">Thank you for your generous gift. No goods or services were provided in exchange for this contribution.</p>
      </div>
    </div>
  );
}
