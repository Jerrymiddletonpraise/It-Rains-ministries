"use client";
import { useActionState, useState } from "react";
import { updatePrayer } from "@/app/actions/admin";
import { Notice, inputCls } from "@/components/ui";

export function PrayerResponseForm({ row }: { row: { id: string; status: string; response: string | null; internal_notes: string | null; hasEmail: boolean } }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(updatePrayer, null);
  if (!open) return <button onClick={() => setOpen(true)} className="mt-3 text-sm font-semibold text-royal-700">Respond / update →</button>;
  return (
    <form action={action} className="mt-4 grid gap-3 rounded-xl bg-ivory p-4 md:grid-cols-2">
      <input type="hidden" name="id" value={row.id} />
      <label className="text-sm font-medium">Status<select name="status" defaultValue={row.status} className={inputCls}>{["new", "praying", "responded", "closed"].map((s) => <option key={s}>{s}</option>)}</select></label>
      <label className="text-sm font-medium">Internal notes (staff only)<input name="internal_notes" defaultValue={row.internal_notes ?? ""} className={inputCls} /></label>
      <label className="text-sm font-medium md:col-span-2">Response to the person<textarea name="response" rows={3} defaultValue={row.response ?? ""} className={inputCls} /></label>
      {row.hasEmail && <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="send_reply" defaultChecked className="accent-royal-700" />Email this response</label>}
      <div className="flex items-center gap-3 md:col-span-2"><button disabled={pending} className="rounded-full bg-royal-700 px-5 py-2 text-sm font-semibold text-white">{pending ? "Saving…" : "Save"}</button>{state && <Notice kind={state.ok ? "success" : "error"}>{state.message}</Notice>}</div>
    </form>
  );
}
