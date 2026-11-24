import { NextResponse } from "next/server";
import { giftSchema } from "../../schema";
import { paypalRequest } from "@/lib/giving";
import { enabled } from "@/lib/env";
import { FUNDS } from "@/lib/utils";
import { rateLimit } from "@/lib/security";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  if (!enabled.paypal) return NextResponse.json({ error: "PayPal is not configured yet." }, { status: 503 });
  if (!(await rateLimit("give", 15, 600))) return NextResponse.json({ error: "Too many attempts, please wait a moment." }, { status: 429 });
  const parsed = giftSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const g = parsed.data;
  if (g.frequency !== "one_time") return NextResponse.json({ error: "Monthly giving is available by card. PayPal supports one-time gifts." }, { status: 400 });
  const { user } = await getSession();
  const order = await paypalRequest<{ id: string }>("/v2/checkout/orders", {
    intent: "CAPTURE",
    purchase_units: [{
      description: `${FUNDS[g.fund].label}, IT RAINS MINISTRIES`.slice(0, 127),
      custom_id: JSON.stringify({ f: g.fund, u: user?.id ?? "" }).slice(0, 127),
      amount: { currency_code: g.currency.toUpperCase(), value: g.amount.toFixed(2) },
    }],
    application_context: { brand_name: "IT RAINS MINISTRIES", shipping_preference: "NO_SHIPPING", user_action: "PAY_NOW" },
  });
  return NextResponse.json({ id: order.id });
}
