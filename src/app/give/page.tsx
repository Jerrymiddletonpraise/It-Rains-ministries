import type { Metadata } from "next";
import { ShieldCheck, Lock, Repeat } from "lucide-react";
import { PageHero, Section, Card, Notice } from "@/components/ui";
import { GiveForm } from "@/components/give/GiveForm";
import { enabled } from "@/lib/env";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Online Giving", description: "Give your tithes, offerings and donations to IT RAINS MINISTRIES securely online." };

export default async function Give({ searchParams }: { searchParams: Promise<{ fund?: string; cancelled?: string }> }) {
  const [sp, session] = await Promise.all([searchParams, getSession()]);
  return (
    <>
      <PageHero eyebrow="Online giving" title="Sow into the Kingdom" intro="“Bring ye all the tithes into the storehouse… and prove me now herewith, saith the LORD of hosts.” Malachi 3:10" />
      <Section>
        <div className="grid gap-10 lg:grid-cols-[3fr_2fr]">
          <Card className="p-6 md:p-10">
            {sp.cancelled && <div className="mb-6"><Notice kind="warn">Your payment was cancelled and you have not been charged.</Notice></div>}
            {!enabled.stripe && !enabled.paypal ? (
              <Notice kind="warn">Online giving is being set up. Please check back soon or contact the ministry office to give.</Notice>
            ) : (
              <GiveForm stripe={enabled.stripe} paypal={enabled.paypal} paypalClientId={process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? ""}
                defaultFund={sp.fund} defaultEmail={session.user?.email ?? ""} defaultName={(session.user?.user_metadata?.full_name as string) ?? ""} />
            )}
          </Card>
          <div className="space-y-5">
            <Card><Lock className="h-8 w-8 text-gold-600" /><h3 className="mt-3 font-serif text-2xl font-bold">Bank-level security</h3><p className="mt-2 text-navy-800/80">Payments are processed by Stripe and PayPal. Your card details are never sent to or stored on our servers.</p></Card>
            <Card><Repeat className="h-8 w-8 text-gold-600" /><h3 className="mt-3 font-serif text-2xl font-bold">Give monthly</h3><p className="mt-2 text-navy-800/80">Set up a recurring gift by card. Members can update or cancel any time from their account.</p></Card>
            <Card><ShieldCheck className="h-8 w-8 text-gold-600" /><h3 className="mt-3 font-serif text-2xl font-bold">Instant receipts</h3><p className="mt-2 text-navy-800/80">A receipt is emailed as soon as your payment is confirmed. Members can see their full giving history.</p></Card>
          </div>
        </div>
      </Section>
    </>
  );
}
