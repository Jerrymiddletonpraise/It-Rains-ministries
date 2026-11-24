"use client";
import { useActionState } from "react";
import { subscribeNewsletter } from "@/app/actions/public";
import { Honeypot } from "@/components/ui";

export function NewsletterForm({ dark }: { dark?: boolean }) {
  const [state, action, pending] = useActionState(subscribeNewsletter, null);
  return (
    <form action={action} className="relative">
      <Honeypot />
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor={`nl-${dark ? "d" : "l"}`}>Email address</label>
        <input id={`nl-${dark ? "d" : "l"}`} name="email" type="email" required placeholder="Your email address"
          className={`min-w-0 flex-1 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 ${dark ? "bg-white/10 text-white placeholder:text-white/50" : "bg-white text-navy-900"}`} />
        <button disabled={pending} className="rounded-full bg-gold-500 px-5 py-3 text-sm font-bold text-navy-950 hover:bg-gold-400 disabled:opacity-60">
          {pending ? "…" : "Subscribe"}
        </button>
      </div>
      {state && <p role="status" className={`mt-2 text-sm ${state.ok ? "text-emerald-400" : "text-red-400"}`}>{state.message}</p>}
    </form>
  );
}
