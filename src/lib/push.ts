import "server-only";
import * as webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";
import { env, enabled } from "@/lib/env";

const configured = () => Boolean(env.vapidPublic && process.env.VAPID_PRIVATE_KEY && enabled.serviceRole);

export async function sendPushToAll(payload: { title: string; body?: string; url?: string }) {
  if (!configured()) return { sent: 0, error: "Push notifications need NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY." };
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || `mailto:${env.ministryInbox || "admin@example.com"}`, env.vapidPublic, process.env.VAPID_PRIVATE_KEY!);
  const db = createAdminClient();
  const { data: subs } = await db.from("push_subscriptions").select("id,endpoint,p256dh,auth").limit(50000);
  let sent = 0;
  const gone: string[] = [];
  await Promise.all((subs ?? []).map(async (s) => {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify(payload), { TTL: 3600 });
      sent++;
    } catch (e) {
      const code = (e as { statusCode?: number }).statusCode;
      if (code === 404 || code === 410) gone.push(s.id);
    }
  }));
  if (gone.length) await db.from("push_subscriptions").delete().in("id", gone);
  return { sent };
}
