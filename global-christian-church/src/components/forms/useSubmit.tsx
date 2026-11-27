import { useState, type FormEvent } from "react";
import { insertRow, type SubmitResult } from "@/lib/data";
import { Notice } from "@/components/ui/Misc";

/** Shared submit flow for public forms: honeypot spam trap, persistence, honest status. */
export function useSubmit(table: string, build: (fd: FormData) => Record<string, unknown>) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    if (fd.get("company_website")) { setResult({ ok: true }); return; } // bot filled the hidden field
    setBusy(true);
    const r = await insertRow(table, build(fd));
    setBusy(false); setResult(r);
    if (r.ok) form.reset();
  }
  return { busy, result, onSubmit };
}

export function Honeypot() {
  return <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden"><label>Leave empty<input name="company_website" tabIndex={-1} autoComplete="off" /></label></div>;
}

export function FormStatus({ result, success }: { result: SubmitResult | null; success: string }) {
  if (!result) return null;
  if (result.ok) return <Notice tone="success" title="Received">{success}</Notice>;
  return <Notice tone={result.reason === "not_configured" ? "warn" : "error"} title={result.reason === "not_configured" ? "Awaiting configuration" : "Not saved"}>{result.message}</Notice>;
}

export const str = (fd: FormData, k: string) => { const v = (fd.get(k) as string | null)?.trim(); return v ? v : null; };
