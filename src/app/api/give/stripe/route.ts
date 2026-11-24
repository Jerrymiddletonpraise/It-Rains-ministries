import { NextResponse } from "next/server";
import { giftSchema } from "../schema";
import { stripe } from "@/lib/giving";
import { env, enabled } from "@/lib/env";
import { FUNDS } from "@/lib/utils";
import { rateLimit } from "@/lib/security";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  if (!enabled.stripe) return NextResponse.json({ error: "Card giving is not configured yet." }, { status: 503 });
  if (!(await rateLimit("give", 15, 600))) return NextResponse.json({ error: "Too many attempts, please wait a moment." }, { status: 429 });
  const parsed = giftSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const g = parsed.data;
  const { user } = await getSession();
  const amount = Math.round(g.amount * 100);
  const label = `${FUNDS[g.fund].label}, IT RAINS MINISTRIES`;
  const metadata = { fund: g.fund, user_id: user?.id ?? "", donor_name: g.name, note: g.note, frequency: g.frequency };

  const session = await stripe().checkout.sessions.create({
    mode: g.frequency === "monthly" ? "subscription" : "payment",
    customer_email: g.email,
    line_items: [{
      quantity: 1,
      price_data: {
        currency: g.currency, unit_amount: amount, product_data: { name: label },
        ...(g.frequency === "monthly" ? { recurring: { interval: "month" as const } } : {}),
      },
    }],
    metadata,
    ...(g.frequency === "monthly"
      ? { subscription_data: { metadata } }
      : { payment_intent_data: { metadata, description: label }, submit_type: "donate" as const, customer_creation: "if_required" as const }),
    success_url: `${env.siteUrl}/give/thank-you?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.siteUrl}/give?cancelled=1`,
  });
  return NextResponse.json({ url: session.url });
}
