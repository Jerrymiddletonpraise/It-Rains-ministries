"use client";
import { submitPrayer } from "@/app/actions/public";
import { ActionForm } from "./ActionForm";
import { Checkbox, Field, Select, TextArea } from "@/components/ui";

export function PrayerForm({ compact, defaultKind = "prayer" }: { compact?: boolean; defaultKind?: string }) {
  return (
    <ActionForm action={submitPrayer} submitLabel="Send prayer request" className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" name="name" required placeholder="Or 'Anonymous'" autoComplete="name" />
        <Field label="Email" name="email" type="email" autoComplete="email" hint={compact ? undefined : "Optional, for a reply"} />
      </div>
      {!compact && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone / WhatsApp" name="phone" type="tel" autoComplete="tel" />
          <Field label="Country" name="country" autoComplete="country-name" />
        </div>
      )}
      <Select label="Type of request" name="kind" defaultValue={defaultKind}>
        <option value="prayer">Prayer request</option>
        <option value="urgent">Urgent prayer request</option>
        <option value="counseling">Request pastoral counseling</option>
        <option value="followup">Request follow-up from the ministry</option>
      </Select>
      <TextArea label="Your request" name="request" required rows={compact ? 3 : 6} placeholder="Share what's on your heart…" />
      <Checkbox name="wants_followup" label="I would like someone from the ministry to contact me." />
      <p className="text-xs text-navy-800/60">Your request is private. Only the pastoral and prayer team can see it.</p>
    </ActionForm>
  );
}
