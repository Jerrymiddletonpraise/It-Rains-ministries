"use client";
import { useActionState, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { saveSetting } from "@/app/actions/admin";
import { Notice, inputCls } from "@/components/ui";
import type { ServiceTime, SettingKey } from "@/lib/defaults";

function Shell({ title, children, state, pending }: { title: string; children: React.ReactNode; state: { ok: boolean; message: string } | null; pending: boolean }) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
      <h2 className="mb-5 font-serif text-2xl font-bold">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
      <div className="mt-5 flex items-center gap-3"><button disabled={pending} className="rounded-full bg-royal-700 px-6 py-2.5 text-sm font-semibold text-white">{pending ? "Saving…" : "Save"}</button>{state && <Notice kind={state.ok ? "success" : "error"}>{state.message}</Notice>}</div>
    </section>
  );
}

export function SettingsForm({ k, title, values, labels, long = [], images = [] }: { k: SettingKey; title: string; values: object; labels: Record<string, string>; long?: string[]; images?: string[] }) {
  const [state, action, pending] = useActionState(saveSetting.bind(null, k), null);
  const v = values as Record<string, unknown>;
  return (
    <form action={action}>
      <Shell title={title} state={state} pending={pending}>
        {Object.entries(labels).map(([name, label]) => {
          const val = Array.isArray(v[name]) ? (v[name] as string[]).join("\n") : String(v[name] ?? "");
          return (
            <label key={name} className={`block text-sm font-medium ${long.includes(name) || images.includes(name) ? "md:col-span-2" : ""}`}>{label}
              {long.includes(name) ? <textarea name={name} defaultValue={val} rows={5} className={inputCls} /> : images.includes(name) ? <ImageInput name={name} initial={val} /> : <input name={name} defaultValue={val} className={inputCls} />}
            </label>
          );
        })}
      </Shell>
    </form>
  );
}

function ImageInput({ name, initial }: { name: string; initial: string }) {
  const [val, setVal] = useState(initial);
  const [busy, setBusy] = useState(false);
  async function upload(file: File) {
    setBusy(true);
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const path = `site/${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g, "_")}`;
    const { error } = await supabase.storage.from("public-assets").upload(path, file, { contentType: file.type });
    if (!error) setVal(supabase.storage.from("public-assets").getPublicUrl(path).data.publicUrl);
    setBusy(false);
  }
  return (
    <span className="flex flex-col gap-2 sm:flex-row">
      <input name={name} value={val} onChange={(e) => setVal(e.target.value)} className={inputCls} placeholder="Image URL or upload" />
      <span className="flex shrink-0 cursor-pointer items-center rounded-xl bg-navy-900 px-4 py-3 text-sm font-semibold text-white" onClick={(e) => (e.currentTarget.querySelector("input") as HTMLInputElement)?.click()}>
        {busy ? "Uploading…" : "Upload"}<input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
      </span>
      {val && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={val} alt="" className="h-12 w-12 rounded object-cover" />
      )}
    </span>
  );
}

export function ServicesForm({ services }: { services: ServiceTime[] }) {
  const [state, action, pending] = useActionState(saveSetting.bind(null, "services"), null);
  const [rows, setRows] = useState(services);
  return (
    <form action={action}>
      <Shell title="Service times" state={state} pending={pending}>
        <div className="space-y-3 md:col-span-2">
          {rows.map((s, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-[1fr_2fr_1fr_auto_auto] sm:items-center">
              <input name="day" defaultValue={s.day} placeholder="Day" className={inputCls} />
              <input name="name" defaultValue={s.name} placeholder="Service name" className={inputCls} />
              <input name="time" defaultValue={s.time} placeholder="Time" className={inputCls} />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="online_idx" value={i} defaultChecked={s.online} className="accent-royal-700" />Streamed</label>
              <button type="button" onClick={() => setRows(rows.filter((_, j) => j !== i))} aria-label="Remove" className="text-red-600"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          <button type="button" onClick={() => setRows([...rows, { day: "", name: "", time: "", online: true }])} className="flex items-center gap-2 text-sm font-semibold text-royal-700"><Plus className="h-4 w-4" />Add service</button>
        </div>
      </Shell>
    </form>
  );
}
