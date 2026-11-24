import type { Metadata } from "next";
import { CheckCircle2, Clock } from "lucide-react";
import { stripe, recordFromSession } from "@/lib/giving";
import { createAdminClient } from "@/lib/supabase/admin";
import { enabled } from "@/lib/env";
import { ButtonLink } from "@/components/ui";
import { formatMoney, FUNDS } from "@/lib/utils";

export const metadata: Metadata = { title: "Thank you", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function ThankYou({ searchParams }: { searchParams: Promise<{ session_id?: string; donation?: string }> }) {
  const sp = await searchParams;
  let status: "paid" | "processing" | "unknown" = "unknown";
  let summary: string | null = null;

  if (sp.session_id && enabled.stripe) {
    // Verify directly with Stripe; never trust the URL alone.
    const s = await stripe().checkout.sessions.retrieve(sp.session_id).catch(() => null);
    if (s && (s.payment_status === "paid" || s.status === "complete")) {
      status = s.payment_status === "paid" ? "paid" : "processing";
      if (s.mode === "payment" && s.payment_status === "paid" && enabled.serviceRole) await recordFromSession(s).catch(() => null);
      summary = `${formatMoney(s.amount_total ?? 0, s.currency ?? "usd")} · ${FUNDS[s.metadata?.fund ?? "offering"]?.label}${s.mode === "subscription" ? " · monthly" : ""}`;
    }
  } else if (sp.donation && enabled.serviceRole && /^[0-9a-f-]{36}$/.test(sp.donation)) {
    const { data } = await createAdminClient().from("donations").select("amount_cents,currency,fund,status").eq("id", sp.donation).maybeSingle();
    if (data?.status === "succeeded") { status = "paid"; summary = `${formatMoney(data.amount_cents, data.currency)} · ${FUNDS[data.fund]?.label}`; }
  }

  return (
    <div className="bg-heaven flex min-h-screen items-center justify-center px-4 pb-16 pt-28">
      <div className="w-full max-w-lg rounded-3xl bg-white p-10 text-center shadow-2xl">
        {status === "unknown" ? <Clock className="mx-auto h-16 w-16 text-gold-500" /> : <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-600" />}
        <h1 className="mt-4 font-serif text-4xl font-bold">{status === "unknown" ? "We couldn't confirm this gift" : "Thank you for giving!"}</h1>
        {summary && <p className="mt-3 text-lg font-semibold text-royal-700">{summary}</p>}
        <p className="mt-4 text-navy-800/75">
          {status === "paid" && "Your gift has been received. A receipt is on its way to your email. May the windows of heaven open over your life."}
          {status === "processing" && "Your payment is processing. You'll receive a receipt by email as soon as it is confirmed."}
          {status === "unknown" && "If you completed a payment, your receipt will arrive by email shortly. Otherwise, please try again or contact us."}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/account/giving" variant="purple">View my giving</ButtonLink>
          <ButtonLink href="/" variant="ghost">Back home</ButtonLink>
        </div>
      </div>
    </div>
  );
}
