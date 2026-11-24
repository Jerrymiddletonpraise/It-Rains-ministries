"use client";
import { registerForEvent } from "@/app/actions/public";
import { ActionForm } from "./ActionForm";
import { Field, TextArea } from "@/components/ui";

export function EventRegistrationForm({ eventId, defaultEmail, defaultName }: { eventId: string; defaultEmail: string; defaultName: string }) {
  return (
    <ActionForm action={registerForEvent} submitLabel="Register now" className="space-y-4">
      <input type="hidden" name="event_id" value={eventId} />
      <Field label="Full name" name="name" required defaultValue={defaultName} autoComplete="name" />
      <Field label="Email" name="email" type="email" required defaultValue={defaultEmail} autoComplete="email" />
      <Field label="Phone (optional)" name="phone" type="tel" autoComplete="tel" />
      <Field label="Additional guests" name="guests" type="number" min={0} max={20} defaultValue={0} />
      <TextArea label="Notes (optional)" name="notes" rows={2} />
    </ActionForm>
  );
}
