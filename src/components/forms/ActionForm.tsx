"use client";
import { useActionState, useEffect, useRef, type ReactNode } from "react";
import { Notice, Honeypot } from "@/components/ui";
import { Turnstile } from "@/components/forms/Turnstile";

export type ActionState = { ok: boolean; message: string } | null;
type Action = (prev: ActionState, form: FormData) => Promise<ActionState>;

/** Wraps a server action with pending state, honeypot, optional Turnstile and result notices. */
export function ActionForm({ action, children, submitLabel = "Submit", className = "space-y-5", resetOnSuccess = true, protect = true, successSlot }: {
  action: Action; children: ReactNode; submitLabel?: string; className?: string; resetOnSuccess?: boolean; protect?: boolean; successSlot?: ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state?.ok && resetOnSuccess) ref.current?.reset(); }, [state, resetOnSuccess]);
  return (
    <form ref={ref} action={formAction} className={`relative ${className}`}>
      {protect && <Honeypot />}
      {children}
      {protect && <Turnstile />}
      {state && <Notice kind={state.ok ? "success" : "error"}>{state.message}</Notice>}
      {state?.ok && successSlot}
      <SubmitButton pending={pending} label={submitLabel} />
    </form>
  );
}

export function SubmitButton({ pending, label }: { pending: boolean; label: string }) {
  return (
    <button type="submit" disabled={pending}
      className="inline-flex w-full items-center justify-center rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold text-navy-950 shadow-lg shadow-gold-500/20 transition hover:bg-gold-400 disabled:opacity-60 sm:w-auto">
      {pending ? "Sending…" : label}
    </button>
  );
}
