import { NextResponse } from "next/server";
import { z } from "zod";
import { paypalRequest, recordDonation } from "@/lib/giving";
import { enabled } from "@/lib/env";

type Capture = {
  id: string; status: string;
  payer?: { email_address?: string; name?: { given_name?: string; surname?: string } };
  purchase_units: { custom_id?: string; payments?: { captures?: { id: string; status: string; amount: { value: string; currency_code: string }; custom_id?: string }[] } }[];
};

export async function POST(req: Request) {
  if (!enabled.paypal) return NextResponse.json({ error: "PayPal is not configured." }, { status: 503 });
  const body = z.object({ orderId: z.string().min(5).max(64), name: z.string().max(120).optional(), email: z.string().email().optional(), note: z.string().max(300).optional() }).safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  // Amount, currency and status come from PayPal's response, never from the browser.
  const result = await paypalRequest<Capture>(`/v2/checkout/orders/${encodeURIComponent(body.data.orderId)}/capture`, {});
  const cap = result.purchase_units[0]?.payments?.captures?.[0];
  if (result.status !== "COMPLETED" || !cap || cap.status !== "COMPLETED") {
    return NextResponse.json({ error: "The payment was not completed." }, { status: 402 });
  }
  let meta: { f?: string; u?: string } = {};
  try { meta = JSON.parse(cap.custom_id ?? result.purchase_units[0]?.custom_id ?? "{}"); } catch {}
  const payerName = [result.payer?.name?.given_name, result.payer?.name?.surname].filter(Boolean).join(" ");
  const donation = await recordDonation({
    provider: "paypal", provider_ref: cap.id, amount_cents: Math.round(parseFloat(cap.amount.value) * 100), currency: cap.amount.currency_code,
    fund: meta.f ?? "offering", frequency: "one_time", user_id: meta.u || null,
    donor_name: body.data.name || payerName || null, donor_email: body.data.email || result.payer?.email_address || null, note: body.data.note || null,
  });
  return NextResponse.json({ ok: true, donationId: donation?.id });
}
