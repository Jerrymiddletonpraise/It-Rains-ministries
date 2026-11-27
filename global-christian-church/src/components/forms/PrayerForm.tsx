import { Lock, Globe2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/Form";
import { useAuth } from "@/auth/AuthProvider";
import { FormStatus, Honeypot, str, useSubmit } from "./useSubmit";

export function PrayerForm() {
  const { user } = useAuth();
  const { busy, result, onSubmit } = useSubmit("prayer_requests", (fd) => ({
    requester_id: user?.id ?? null,
    name: fd.get("anonymous") === "on" ? null : str(fd, "name"),
    email: str(fd, "email"), phone: str(fd, "phone"),
    category: str(fd, "category") ?? "general",
    request: str(fd, "request"),
    visibility: fd.get("visibility") === "public" ? "public" : "private",
    is_anonymous: fd.get("anonymous") === "on",
    wants_follow_up: fd.get("follow_up") === "on",
    consent_given: fd.get("consent") === "on",
  }));
  return (
    <form onSubmit={onSubmit} className="relative grid gap-5" aria-label="Prayer request">
      <Honeypot />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" htmlFor="pr-name"><Input id="pr-name" name="name" autoComplete="name" /></Field>
        <Field label="Email" htmlFor="pr-email" hint="Only used if you ask for follow-up."><Input id="pr-email" name="email" type="email" autoComplete="email" /></Field>
        <Field label="Phone" htmlFor="pr-phone"><Input id="pr-phone" name="phone" type="tel" autoComplete="tel" /></Field>
        <Field label="Category" htmlFor="pr-cat">
          <Select id="pr-cat" name="category" defaultValue="general">
            {["general", "healing", "family", "salvation", "provision", "guidance", "grief", "thanksgiving", "other"].map((c) => <option key={c} value={c}>{c[0].toUpperCase() + c.slice(1)}</option>)}
          </Select>
        </Field>
      </div>
      <Field label="Your prayer request" htmlFor="pr-req" required><Textarea id="pr-req" name="request" required maxLength={4000} rows={6} /></Field>
      <fieldset className="grid gap-3 sm:grid-cols-2">
        <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-ivory-muted">Who may see this request?</legend>
        <label className="flex cursor-pointer gap-3 rounded-xl border border-line p-4 has-[:checked]:border-gold/70 has-[:checked]:bg-gold/5">
          <input type="radio" name="visibility" value="private" defaultChecked className="mt-1 accent-[hsl(var(--gold))]" />
          <span><span className="flex items-center gap-2 font-semibold text-ivory"><Lock className="h-4 w-4 text-gold" aria-hidden />Private</span><span className="text-xs text-ivory-muted">Only the prayer team and pastors can read it.</span></span>
        </label>
        <label className="flex cursor-pointer gap-3 rounded-xl border border-line p-4 has-[:checked]:border-gold/70 has-[:checked]:bg-gold/5">
          <input type="radio" name="visibility" value="public" className="mt-1 accent-[hsl(var(--gold))]" />
          <span><span className="flex items-center gap-2 font-semibold text-ivory"><Globe2 className="h-4 w-4 text-gold" aria-hidden />Prayer wall</span><span className="text-xs text-ivory-muted">Shared on the public prayer wall after the prayer team approves it.</span></span>
        </label>
      </fieldset>
      <div className="space-y-3">
        <Checkbox id="pr-anon" name="anonymous" label="Keep my name hidden" />
        <Checkbox id="pr-follow" name="follow_up" label="I would like someone from the church to follow up with me" />
        <Checkbox id="pr-consent" name="consent" required label="I agree that Global Christian Church may store this request so the prayer team can pray for me, as described in the Privacy Policy." />
      </div>
      <Button type="submit" disabled={busy} size="lg">{busy ? "Sending…" : "Submit prayer request"}</Button>
      <FormStatus result={result} success="Your request has been received. Our prayer team will be praying for you." />
    </form>
  );
}
