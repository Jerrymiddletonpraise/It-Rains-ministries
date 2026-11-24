"use client";
import { useActionState } from "react";
import { sendNewsletter, sendPushNotification } from "@/app/actions/newsletter";
import { Notice, inputCls } from "@/components/ui";

export function NewsletterComposer() {
  const [state, action, pending] = useActionState(sendNewsletter, null);
  return (
    <form action={action} className="space-y-4">
      <label className="block text-sm font-medium">Subject<input name="subject" required className={inputCls} /></label>
      <label className="block text-sm font-medium">Message<textarea name="body" required rows={10} className={inputCls} placeholder="Write your message. Line breaks are kept." /></label>
      <label className="block text-sm font-medium">Send to<select name="audience" className={inputCls}><option value="subscribers">Newsletter subscribers</option><option value="members">Members who opted in</option><option value="all">Everyone (subscribers + members)</option></select></label>
      {state && <Notice kind={state.ok ? "success" : "error"}>{state.message}</Notice>}
      <div className="flex flex-wrap gap-2">
        <button name="test" value="1" disabled={pending} className="rounded-full px-5 py-2.5 text-sm font-semibold ring-1 ring-navy-900/15">Send test to me</button>
        <button disabled={pending} className="rounded-full bg-royal-700 px-6 py-2.5 text-sm font-semibold text-white">{pending ? "Sending…" : "Send newsletter"}</button>
      </div>
    </form>
  );
}

export function PushComposer() {
  const [state, action, pending] = useActionState(sendPushNotification, null);
  return (
    <form action={action} className="space-y-4">
      <label className="block text-sm font-medium">Title<input name="title" required maxLength={60} className={inputCls} placeholder="We're live!" /></label>
      <label className="block text-sm font-medium">Message<input name="body" maxLength={140} className={inputCls} placeholder="Join Sunday worship now" /></label>
      <label className="block text-sm font-medium">Open page<input name="url" defaultValue="/watch" className={inputCls} /></label>
      {state && <Notice kind={state.ok ? "success" : "error"}>{state.message}</Notice>}
      <button disabled={pending} className="rounded-full bg-gold-500 px-6 py-2.5 text-sm font-bold text-navy-950">{pending ? "Sending…" : "Send notification"}</button>
    </form>
  );
}
