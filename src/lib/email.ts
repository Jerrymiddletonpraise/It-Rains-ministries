import "server-only";
import { Resend } from "resend";
import { env, enabled } from "@/lib/env";
import { escapeHtml } from "@/lib/utils";

const resend = enabled.email ? new Resend(env.resendKey) : null;

export function emailLayout(title: string, bodyHtml: string) {
  return `<!doctype html><html><body style="margin:0;background:#f6f3ea;font-family:Georgia,serif;color:#14163a">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 12px">
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:12px;overflow:hidden">
  <tr><td style="background:linear-gradient(135deg,#0b1033,#3b1670);padding:28px;text-align:center">
    <div style="color:#d4af37;font-size:22px;letter-spacing:3px;font-weight:bold">IT RAINS MINISTRIES</div>
    <div style="color:#e9e2ff;font-size:13px;margin-top:6px;font-style:italic">Where Heaven&#39;s Abundance Rains Upon Lives</div>
  </td></tr>
  <tr><td style="padding:32px;font-family:Arial,sans-serif;font-size:15px;line-height:1.6">
    <h1 style="font-family:Georgia,serif;color:#3b1670;font-size:22px;margin:0 0 16px">${escapeHtml(title)}</h1>
    ${bodyHtml}
  </td></tr>
  <tr><td style="padding:18px;background:#0b1033;color:#bfc3e6;font-family:Arial,sans-serif;font-size:12px;text-align:center">
    <a href="${env.siteUrl}" style="color:#d4af37">${env.siteUrl.replace(/^https?:\/\//, "")}</a>
  </td></tr></table></td></tr></table></body></html>`;
}

export type SendResult = { sent: boolean; reason?: string };

/** Sends an email through Resend. Returns {sent:false} (never pretends) when email isn't configured. */
export async function sendEmail(opts: { to: string | string[]; subject: string; title?: string; html: string; replyTo?: string }): Promise<SendResult> {
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY not set; email "${opts.subject}" was not sent.`);
    return { sent: false, reason: "Email is not configured" };
  }
  const { error } = await resend.emails.send({
    from: env.emailFrom,
    to: opts.to,
    subject: opts.subject,
    html: emailLayout(opts.title ?? opts.subject, opts.html),
    replyTo: opts.replyTo,
  });
  if (error) {
    console.error("[email] send failed", error);
    return { sent: false, reason: error.message };
  }
  return { sent: true };
}

export async function notifyMinistry(subject: string, html: string, replyTo?: string) {
  if (!env.ministryInbox) return { sent: false, reason: "MINISTRY_INBOX_EMAIL not set" };
  return sendEmail({ to: env.ministryInbox, subject, html, replyTo });
}

export const p = (s: string) => `<p style="margin:0 0 14px">${escapeHtml(s).replace(/\n/g, "<br>")}</p>`;
export const button = (href: string, label: string) =>
  `<p style="margin:24px 0"><a href="${href}" style="background:#d4af37;color:#0b1033;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:bold">${escapeHtml(label)}</a></p>`;

/** Sends one personalised email per recipient in batches of 100 (Resend batch API). */
export async function sendBatch(items: { to: string; subject: string; title?: string; html: string }[]) {
  if (!resend) return { sent: 0, reason: "Email is not configured" };
  let sent = 0;
  for (let i = 0; i < items.length; i += 100) {
    const chunk = items.slice(i, i + 100).map((m) => ({ from: env.emailFrom, to: m.to, subject: m.subject, html: emailLayout(m.title ?? m.subject, m.html) }));
    const { error } = await resend.batch.send(chunk);
    if (error) { console.error("[email] batch failed", error); return { sent, reason: error.message }; }
    sent += chunk.length;
  }
  return { sent };
}
