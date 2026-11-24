"use client";
import { useActionState, useState } from "react";
import { createStream } from "@/app/actions/live";
import { Notice, inputCls } from "@/components/ui";
import { PlatformFields } from "./PlatformFields";

export function NewStreamForm() {
  const [state, action, pending] = useActionState(createStream, null);
  const [source, setSource] = useState(process.env.NEXT_PUBLIC_LIVEKIT_URL ? "browser" : "youtube");
  const [when, setWhen] = useState("");
  return (
    <form action={action} className="space-y-4">
      <label className="block text-sm font-medium">Title<input name="title" required className={inputCls} placeholder="Sunday Worship Service" /></label>
      <label className="block text-sm font-medium">Description<textarea name="description" rows={2} className={inputCls} /></label>
      <label className="block text-sm font-medium">Broadcast from
        <select name="source" value={source} onChange={(e) => setSource(e.target.value)} className={inputCls}>
          <option value="youtube">YouTube Live (free, recommended)</option>
          <option value="facebook">Facebook Live (free)</option>
          <option value="browser">Phone / laptop camera in this browser (needs LiveKit)</option>
          <option value="rtmp">OBS straight to this site (needs LiveKit)</option>
        </select>
      </label>
      {source === "youtube" && <p className="text-xs text-navy-800/60">In YouTube Studio click Create → Go live, choose Webcam or Streaming software (OBS), then copy the share link below. YouTube records the service automatically.</p>}
      {source === "facebook" && <p className="text-xs text-navy-800/60">Go live on your Facebook Page (Live video, or Streaming software with OBS). The video must be Public. Then open it, click Share → Copy link and paste it below.</p>}
      <PlatformFields main={source} />
      <label className="block text-sm font-medium">Scheduled for (optional)
        <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className={inputCls} />
        <input type="hidden" name="scheduled_for__iso" value={when ? new Date(when).toISOString() : ""} />
      </label>
      {!["youtube", "facebook"].includes(source) && <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="record" defaultChecked className="accent-royal-700" />Record automatically and save replay</label>}
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="chat_enabled" defaultChecked className="accent-royal-700" />Enable live chat</label>
      {state && !state.ok && <Notice kind="error">{state.message}</Notice>}
      <button disabled={pending} className="w-full rounded-full bg-gold-500 py-3 font-bold text-navy-950 disabled:opacity-60">{pending ? "Creating…" : "Create & open studio"}</button>
    </form>
  );
}
