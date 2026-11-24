"use client";
import { useActionState, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import type { EntityDef, FieldDef } from "@/lib/admin-entities";
import type { ActionState } from "@/components/forms/ActionForm";
import { Notice, inputCls } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Row = Record<string, unknown>;

function toLocalInput(iso: unknown) {
  if (!iso) return "";
  const d = new Date(String(iso));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EntityForm({ def, row, action }: { def: EntityDef; row: Row | null; action: (s: ActionState, f: FormData) => Promise<ActionState> }) {
  const [state, formAction, pending] = useActionState(action, null);
  return (
    <form action={formAction} className="grid gap-5 md:grid-cols-2">
      {def.fields.map((f) => <FieldInput key={f.name} f={f} value={row ? row[f.name] : f.default} />)}
      <div className="space-y-3 md:col-span-2">
        {state && <Notice kind={state.ok ? "success" : "error"}>{state.message}</Notice>}
        <button disabled={pending} className="rounded-full bg-royal-700 px-8 py-3 font-semibold text-white hover:bg-royal-800 disabled:opacity-60">{pending ? "Saving…" : row ? "Save changes" : `Create ${def.singular}`}</button>
      </div>
    </form>
  );
}

function FieldInput({ f, value }: { f: FieldDef; value: unknown }) {
  const wrap = cn("block", f.full && "md:col-span-2");
  const label = <span className="mb-1.5 block text-sm font-medium text-navy-800">{f.label}{f.required && <span className="text-red-600"> *</span>}</span>;
  const hint = f.hint && <span className="mt-1 block text-xs text-navy-800/60">{f.hint}</span>;
  switch (f.type) {
    case "bool":
      return <label className="flex items-center gap-3 text-sm font-medium"><input type="checkbox" name={f.name} defaultChecked={Boolean(value)} className="h-5 w-5 accent-royal-700" />{f.label}</label>;
    case "textarea":
      return <label className={wrap}>{label}<textarea name={f.name} rows={6} defaultValue={String(value ?? "")} required={f.required} className={inputCls} />{hint}</label>;
    case "list":
      return <label className={wrap}>{label}<textarea name={f.name} rows={4} defaultValue={Array.isArray(value) ? value.join("\n") : ""} className={inputCls} />{hint}</label>;
    case "select":
      return <label className={wrap}>{label}<select name={f.name} defaultValue={String(value ?? Object.keys(f.options ?? {})[0])} className={inputCls}>{Object.entries(f.options ?? {}).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>{hint}</label>;
    case "datetime":
      return <DateTimeField f={f} value={value} wrap={wrap} label={label} />;
    case "image":
    case "file":
      return <UploadField f={f} value={value} wrap={wrap} label={label} hint={hint} />;
    default:
      return <label className={wrap}>{label}<input name={f.name} type={f.type === "number" ? "number" : f.type === "date" ? "date" : f.type === "url" ? "url" : "text"} defaultValue={value === null || value === undefined ? "" : String(value)} required={f.required} className={inputCls} />{hint}</label>;
  }
}

function DateTimeField({ f, value, wrap, label }: { f: FieldDef; value: unknown; wrap: string; label: React.ReactNode }) {
  const [local, setLocal] = useState(toLocalInput(value));
  return (
    <label className={wrap}>{label}
      <input type="datetime-local" name={f.name} value={local} onChange={(e) => setLocal(e.target.value)} required={f.required} className={inputCls} />
      <input type="hidden" name={`${f.name}__iso`} value={local ? new Date(local).toISOString() : ""} />
      <span className="mt-1 block text-xs text-navy-800/60">In your device&apos;s local time.</span>
    </label>
  );
}

function UploadField({ f, value, wrap, label, hint }: { f: FieldDef; value: unknown; wrap: string; label: React.ReactNode; hint: React.ReactNode }) {
  const [val, setVal] = useState(String(value ?? ""));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function upload(file: File) {
    setBusy(true); setErr("");
    const supabase = createClient();
    const bucket = f.bucket ?? "public-assets";
    const path = `${new Date().getFullYear()}/${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g, "_")}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { cacheControl: "31536000", upsert: false, contentType: file.type });
    setBusy(false);
    if (error) return setErr(error.message);
    if (bucket === "public-assets") setVal(supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl);
    else setVal(f.name === "file_path" ? path : `storage://${bucket}/${path}`);
  }
  return (
    <div className={wrap}>
      {label}
      <div className="flex flex-col gap-2 sm:flex-row">
        <input name={f.name} value={val} onChange={(e) => setVal(e.target.value)} placeholder={f.type === "image" ? "Image URL or upload" : "Link or upload"} className={inputCls} />
        <label className="flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-navy-900 px-4 py-3 text-sm font-semibold text-white">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}{busy ? "Uploading…" : "Upload"}
          <input type="file" className="hidden" accept={f.type === "image" ? "image/*" : f.accept} onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        </label>
      </div>
      {f.type === "image" && val && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={val} alt="" className="mt-2 h-24 rounded-lg object-cover" />
      )}
      {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
      {hint}
    </div>
  );
}
