import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  if (token && /^[0-9a-f-]{36}$/.test(token)) await createAdminClient().from("newsletter_subscribers").update({ subscribed: false }).eq("unsubscribe_token", token);
  return new Response(`<!doctype html><meta name="viewport" content="width=device-width"><body style="font-family:Georgia,serif;background:#0b1033;color:#fff;display:grid;place-items:center;min-height:100vh;margin:0;text-align:center;padding:20px"><div><h1 style="color:#d4af37">You've been unsubscribed</h1><p>You will no longer receive the IT RAINS MINISTRIES newsletter.</p><p><a style="color:#d4af37" href="/">Return to the website</a></p></div></body>`, { headers: { "Content-Type": "text/html" } });
}
