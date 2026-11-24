import "server-only";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";
import { sendEmail, p, button } from "@/lib/email";
import { formatMoney, formatDate, FUNDS } from "@/lib/utils";

export const CURRENCIES = ["usd", "eur", "gbp", "cad", "aud"] as const;
export type Fund = keyof typeof FUNDS;

let _stripe: Stripe | null = null;
export function stripe() {
  if (!env.stripeSecret) throw new Error("STRIPE_SECRET_KEY is not configured");
  return (_stripe ??= new Stripe(env.stripeSecret));
}

export type DonationInput = {
  user_id?: string | null; donor_name?: string | null; donor_email?: string | null; amount_cents: number; currency: string;
  fund: string; frequency: "one_time" | "monthly"; provider: "stripe" | "paypal"; provider_ref: string;
  provider_subscription_id?: string | null; note?: string | null;
};

/** Idempotently records a verified donation and emails a receipt once. */
export async function recordDonation(d: DonationInput) {
  const db = createAdminClient();
  const fund = d.fund in FUNDS ? d.fund : "offering";
  const { data: existing } = await db.from("donations").select("*").eq("provider", d.provider).eq("provider_ref", d.provider_ref).maybeSingle();
  if (existing) return existing;
  // link to member account by email if not already linked
  let userId = d.user_id || null;
  if (!userId && d.donor_email) {
    const { data } = await db.rpc("user_id_by_email", { e: d.donor_email.toLowerCase() });
    userId = (data as string | null) ?? null;
  }
  const { data: row, error } = await db.from("donations").insert({ ...d, fund, user_id: userId, currency: d.currency.toLowerCase(), status: "succeeded" }).select("*").single();
  if (error) {
    if (error.code === "23505") return (await db.from("donations").select("*").eq("provider", d.provider).eq("provider_ref", d.provider_ref).single()).data;
    throw error;
  }
  if (row.donor_email) {
    const res = await sendEmail({
      to: row.donor_email,
      subject: `Thank you for your gift: receipt ${row.receipt_number}`,
      title: "Thank you for your generosity",
      html: p(`Dear ${row.donor_name || "Friend"},`) +
        p(`We have received your ${row.frequency === "monthly" ? "monthly " : ""}gift to IT RAINS MINISTRIES. May the Lord multiply it back to you, pressed down, shaken together and running over.`) +
        `<table style="width:100%;border-collapse:collapse;margin:16px 0">${[
          ["Receipt number", row.receipt_number], ["Date", formatDate(row.created_at)], ["Fund", FUNDS[row.fund]?.label ?? row.fund],
          ["Amount", formatMoney(row.amount_cents, row.currency)], ["Payment method", row.provider === "stripe" ? "Card / wallet (Stripe)" : "PayPal"], ["Reference", row.provider_ref],
        ].map(([k, v]) => `<tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666">${k}</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">${v}</td></tr>`).join("")}</table>` +
        button(`${env.siteUrl}/give/receipt/${row.id}?k=${receiptKey(row.id)}`, "View printable receipt") +
        p("No goods or services were provided in exchange for this contribution."),
    });
    if (res.sent) await db.from("donations").update({ receipt_sent_at: new Date().toISOString() }).eq("id", row.id);
  }
  return row;
}

import { createHmac } from "crypto";
/** Unguessable key so donors without an account can open their own receipt link. */
export function receiptKey(id: string) {
  return createHmac("sha256", env.supabaseServiceKey || "irm").update(`receipt:${id}`).digest("hex").slice(0, 24);
}

// ---------------------------------------------------------------- PayPal
const paypalBase = () => (env.paypalEnv === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com");

async function paypalToken() {
  const res = await fetch(`${paypalBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${Buffer.from(`${env.paypalClientId}:${env.paypalSecret}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`PayPal auth failed: ${res.status}`);
  return ((await res.json()) as { access_token: string }).access_token;
}

export async function paypalRequest<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${paypalBase()}${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: { Authorization: `Bearer ${await paypalToken()}`, "Content-Type": "application/json", Prefer: "return=representation" },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`PayPal ${path} failed: ${JSON.stringify(json).slice(0, 300)}`);
  return json as T;
}

export async function recordFromSession(s: Stripe.Checkout.Session) {
  const pi = typeof s.payment_intent === "string" ? s.payment_intent : s.payment_intent?.id;
  if (!pi || !s.amount_total) return null;
  return recordDonation({
    provider: "stripe", provider_ref: pi, amount_cents: s.amount_total, currency: s.currency ?? "usd",
    fund: s.metadata?.fund ?? "offering", frequency: "one_time", user_id: s.metadata?.user_id || null,
    donor_name: s.metadata?.donor_name || s.customer_details?.name || null,
    donor_email: s.customer_details?.email ?? s.customer_email ?? null, note: s.metadata?.note || null,
  });
}
