"use client";
import { useActionState, useState } from "react";
import { createStream } from "@/app/actions/live";
import { Notice, inputCls } from "@/components/ui";

export function NewStreamForm() {
  const [state, action, pending] = useActionState(createStream, null);
  const [source, setSource] = useState("browser");
  const [when, setWhen] = useState("");
  return (
    <form action={action} className="space-y-4">
      <label className="block text-sm font-medium">Title<input name="title" required className={inputCls} placeholder="Sunday Worship Service" /></label>
      <label className="block text-sm font-medium">Description<textarea name="description" rows={2} className={inputCls} /></label>
      <label className="block text-sm font-medium">Broadcast from
        <select name="source" value={source} onChange={(e) => setSource(e.target.value)} className={inputCls}>
          <option value="browser">Phone / laptop camera (browser)</option>
          <option value="rtmp">OBS, vMix or hardware encoder (RTMP)</option>
          <option value="youtube">YouTube Live (embed)</option>
        </select>
      </label>
      {source === "youtube" && <label className="block text-sm font-medium">YouTube live URL<input name="youtube_url" type="url" required className={inputCls} placeholder="https://www.youtube.com/live/…" /></label>}
      <label className="block text-sm font-medium">Scheduled for (optional)
        <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className={inputCls} />
        <input type="hidden" name="scheduled_for__iso" value={when ? new Date(when).toISOString() : ""} />
      </label>
      {source !== "youtube" && <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="record" defaultChecked className="accent-royal-700" />Record automatically and save replay</label>}
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="chat_enabled" defaultChecked className="accent-royal-700" />Enable live chat</label>
      {state && !state.ok && <Notice kind="error">{state.message}</Notice>}
      <button disabled={pending} className="w-full rounded-full bg-gold-500 py-3 font-bold text-navy-950 disabled:opacity-60">{pending ? "Creating…" : "Create & open studio"}</button>
    </form>
  );
}
