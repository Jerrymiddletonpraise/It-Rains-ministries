import { NextResponse } from "next/server";
import { stripe } from "@/lib/giving";
import { env, enabled } from "@/lib/env";
import { getSession } from "@/lib/auth";

/** Opens Stripe's customer portal so members can update or cancel monthly gifts. */
export async function POST(req: Request) {
  const { user, supabase } = await getSession();
  if (!user || !supabase || !enabled.stripe) return NextResponse.redirect(new URL("/login", req.url), 303);
  const { data } = await supabase.from("recurring_gifts").select("provider_customer_id").eq("user_id", user.id).not("provider_customer_id", "is", null).limit(1).maybeSingle();
  if (!data?.provider_customer_id) return NextResponse.redirect(new URL("/account/giving?portal=none", req.url), 303);
  const portal = await stripe().billingPortal.sessions.create({ customer: data.provider_customer_id, return_url: `${env.siteUrl}/account/giving` });
  return NextResponse.redirect(portal.url, 303);
}
