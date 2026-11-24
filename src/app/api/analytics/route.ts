import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { enabled } from "@/lib/env";
import { rateLimit } from "@/lib/security";

// Anonymous page view counter (no cookies, no IP stored).
export async function POST(req: Request) {
  if (!enabled.serviceRole) return new NextResponse(null, { status: 204 });
  if (!(await rateLimit("pv", 120, 600))) return new NextResponse(null, { status: 204 });
  try {
    const { path, referrer } = JSON.parse(await req.text());
    if (typeof path !== "string" || path.length > 300) return new NextResponse(null, { status: 400 });
    const ua = req.headers.get("user-agent") ?? "";
    if (/bot|crawl|spider|preview/i.test(ua)) return new NextResponse(null, { status: 204 });
    const device = /mobile|iphone|android/i.test(ua) ? "mobile" : /ipad|tablet/i.test(ua) ? "tablet" : "desktop";
    const country = req.headers.get("x-vercel-ip-country") ?? req.headers.get("cf-ipcountry");
    let ref: string | null = null;
    try { ref = referrer ? new URL(referrer).hostname : null; } catch {}
    await createAdminClient().from("page_views").insert({ path, referrer: ref, country, device });
  } catch {}
  return new NextResponse(null, { status: 204 });
}
