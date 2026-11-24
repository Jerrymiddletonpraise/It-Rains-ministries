import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, recordDonation, recordFromSession } from "@/lib/giving";
import { createAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";

export const runtime = "nodejs";

/** Stripe is the source of truth: donations are only recorded from signed webhook events. */
export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  if (!sig || !env.stripeWebhookSecret) return NextResponse.json({ error: "not configured" }, { status: 400 });
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(await req.text(), sig, env.stripeWebhookSecret);
  } catch (e) {
    return NextResponse.json({ error: `Invalid signature: ${(e as Error).message}` }, { status: 400 });
  }
  const db = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const s = event.data.object as Stripe.Checkout.Session;
      if (s.mode === "payment" && s.payment_status === "paid") await recordFromSession(s);
      if (s.mode === "subscription" && s.subscription) {
        const subId = typeof s.subscription === "string" ? s.subscription : s.subscription.id;
        await db.from("recurring_gifts").upsert({
          provider_subscription_id: subId, provider_customer_id: typeof s.customer === "string" ? s.customer : s.customer?.id,
          user_id: s.metadata?.user_id || null, donor_email: s.customer_details?.email ?? s.customer_email,
          amount_cents: s.amount_total ?? 0, currency: s.currency ?? "usd", fund: s.metadata?.fund ?? "offering", status: "active",
        }, { onConflict: "provider_subscription_id" });
      }
      break;
    }
    case "invoice.paid": {
      const inv = event.data.object as Stripe.Invoice;
      const details = inv.parent?.subscription_details;
      if (!details?.subscription || !inv.amount_paid) break;
      const subId = typeof details.subscription === "string" ? details.subscription : details.subscription.id;
      const meta = details.metadata ?? {};
      await recordDonation({
        provider: "stripe", provider_ref: inv.id!, provider_subscription_id: subId, amount_cents: inv.amount_paid, currency: inv.currency,
        fund: meta.fund ?? "offering", frequency: "monthly", user_id: meta.user_id || null,
        donor_name: meta.donor_name || inv.customer_name || null, donor_email: inv.customer_email ?? null, note: meta.note || null,
      });
      break;
    }
    case "charge.refunded": {
      const c = event.data.object as Stripe.Charge;
      const pi = typeof c.payment_intent === "string" ? c.payment_intent : c.payment_intent?.id;
      if (pi && c.refunded) await db.from("donations").update({ status: "refunded" }).eq("provider", "stripe").eq("provider_ref", pi);
      break;
    }
    case "customer.subscription.deleted":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      await db.from("recurring_gifts").update({ status: sub.status }).eq("provider_subscription_id", sub.id);
      break;
    }
  }
  return NextResponse.json({ received: true });
}
