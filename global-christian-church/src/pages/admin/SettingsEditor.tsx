import { useEffect, useState, type FormEvent } from "react";
import { Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { defaultSettings, invalidateSettings, type SiteSettings } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Form";
import { Notice } from "@/components/ui/Misc";

type FieldDef = { name: string; label: string; type?: "text" | "textarea" | "url" | "email" | "tel" | "image" | "lines"; hint?: string };
const GROUPS: { key: keyof SiteSettings; label: string; fields: FieldDef[] }[] = [
  { key: "senior_pastor", label: "Senior Pastor", fields: [
    { name: "name", label: "Name" }, { name: "title", label: "Title" }, { name: "photo_url", label: "Photograph", type: "image" },
    { name: "bio", label: "Biography", type: "textarea" }, { name: "email", label: "Public contact email", type: "email" },
  ] },
  { key: "church_profile", label: "Church details", fields: [
    { name: "name", label: "Church name" }, { name: "tagline", label: "Tagline" }, { name: "address", label: "Address", type: "textarea" },
    { name: "phone", label: "Phone", type: "tel" }, { name: "email", label: "Email", type: "email" },
    { name: "whatsapp", label: "WhatsApp number", type: "tel", hint: "International format, e.g. +15551234567" }, { name: "timezone", label: "Time zone", hint: "e.g. America/New_York" },
  ] },
  { key: "hero", label: "Homepage hero", fields: [
    { name: "headline", label: "Headline" }, { name: "subheadline", label: "Sub-headline", type: "textarea" },
    { name: "image_url", label: "Hero image", type: "image" }, { name: "video_url", label: "Hero video URL (MP4)", type: "url" },
  ] },
  { key: "welcome", label: "Welcome message", fields: [{ name: "title", label: "Eyebrow" }, { name: "body", label: "Message", type: "textarea" }] },
  { key: "about", label: "About page", fields: [{ name: "body", label: "Church story and history", type: "textarea" }] },
  { key: "mission_vision", label: "Mission and vision", fields: [
    { name: "mission", label: "Mission statement", type: "textarea" }, { name: "vision", label: "Vision statement", type: "textarea" },
    { name: "values", label: "Core values", type: "lines", hint: "One value per line" },
  ] },
  { key: "social", label: "Social media", fields: [
    { name: "youtube", label: "YouTube", type: "url" }, { name: "facebook", label: "Facebook", type: "url" }, { name: "instagram", label: "Instagram", type: "url" },
    { name: "tiktok", label: "TikTok", type: "url" }, { name: "twitch", label: "Twitch", type: "url" }, { name: "x", label: "X", type: "url" },
  ] },
];

export default function SettingsEditor() {
  const [tab, setTab] = useState<keyof SiteSettings>("senior_pastor");
  const [values, setValues] = useState<Record<string, Record<string, unknown>>>({});
  const [status, setStatus] = useState<{ tone: "success" | "error"; msg: string } | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const group = GROUPS.find((g) => g.key === tab)!;

  useEffect(() => {
    supabase?.from("site_settings").select("key,value").then(({ data }) => {
      const v: Record<string, Record<string, unknown>> = {};
      for (const g of GROUPS) v[g.key] = { ...(defaultSettings[g.key] as object), ...((data ?? []).find((r) => r.key === g.key)?.value ?? {}) };
      setValues(v);
    });
  }, []);

  const cur = values[tab] ?? {};
  const set = (name: string, val: unknown) => setValues((v) => ({ ...v, [tab]: { ...v[tab], [name]: val } }));

  async function upload(name: string, file: File) {
    if (!supabase) return;
    setUploading(name);
    const path = `site/${tab}-${name}-${Date.now()}.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage.from("public-media").upload(path, file, { upsert: false, contentType: file.type });
    setUploading(null);
    if (error) { setStatus({ tone: "error", msg: `Upload failed: ${error.message}` }); return; }
    set(name, supabase.storage.from("public-media").getPublicUrl(path).data.publicUrl);
  }

  async function save(e: FormEvent) {
    e.preventDefault(); if (!supabase) return;
    const clean = Object.fromEntries(Object.entries(cur).map(([k, v]) => [k, typeof v === "string" ? (v.trim() || null) : v]));
    const { error } = await supabase.from("site_settings").upsert({ key: tab, value: clean });
    if (error) setStatus({ tone: "error", msg: error.message });
    else { invalidateSettings(); setStatus({ tone: "success", msg: `${group.label} saved. Changes are live on the website.` }); }
  }

  return (
    <div>
      <p className="eyebrow">GCC Control Center</p>
      <h1 className="mt-3 text-4xl">Website settings</h1>
      <div className="mt-6 flex flex-wrap gap-2" role="tablist">{GROUPS.map((g) => <button key={g.key} role="tab" aria-selected={tab === g.key} onClick={() => { setTab(g.key); setStatus(null); }} className={cn("rounded-full border px-4 py-2 text-sm", tab === g.key ? "border-gold bg-gold/10 text-gold-light" : "border-line text-ivory-muted")}>{g.label}</button>)}</div>
      <form onSubmit={save} className="mt-8 max-w-2xl space-y-5 rounded-2xl border border-line bg-charcoal p-6">
        {group.fields.map((f) => {
          const id = `s-${tab}-${f.name}`; const raw = cur[f.name];
          if (f.type === "image") return (
            <Field key={f.name} label={f.label} htmlFor={id} hint={f.hint}>
              <div className="flex items-center gap-4">
                {typeof raw === "string" && raw && <img src={raw} alt="" className="h-20 w-20 rounded-xl object-cover" />}
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-gold/60 px-4 py-2 text-sm text-gold-light hover:bg-gold/10">
                  <Upload className="h-4 w-4" aria-hidden />{uploading === f.name ? "Uploading…" : "Upload image"}
                  <input id={id} type="file" accept="image/*" className="sr-only" onChange={(e) => e.target.files?.[0] && upload(f.name, e.target.files[0])} />
                </label>
                {typeof raw === "string" && raw && <button type="button" className="text-xs text-ivory-muted underline" onClick={() => set(f.name, null)}>Remove</button>}
              </div>
            </Field>
          );
          if (f.type === "lines") return <Field key={f.name} label={f.label} htmlFor={id} hint={f.hint}><Textarea id={id} value={Array.isArray(raw) ? raw.join("\n") : ""} onChange={(e) => set(f.name, e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))} /></Field>;
          if (f.type === "textarea") return <Field key={f.name} label={f.label} htmlFor={id} hint={f.hint}><Textarea id={id} value={(raw as string) ?? ""} onChange={(e) => set(f.name, e.target.value)} rows={6} /></Field>;
          return <Field key={f.name} label={f.label} htmlFor={id} hint={f.hint}><Input id={id} type={f.type ?? "text"} value={(raw as string) ?? ""} onChange={(e) => set(f.name, e.target.value)} /></Field>;
        })}
        <Button type="submit">Save {group.label.toLowerCase()}</Button>
        {status && <Notice tone={status.tone}>{status.msg}</Notice>}
      </form>
      <p className="mt-6 max-w-2xl text-xs text-ivory-muted">The statement of faith (What We Believe) is edited in the Website content area so that each belief can be added and ordered separately.</p>
    </div>
  );
}
