"use client";
import { submitTestimony } from "@/app/actions/public";
import { ActionForm } from "./ActionForm";
import { Checkbox, Field, TextArea } from "@/components/ui";

export function TestimonyForm() {
  return (
    <ActionForm action={submitTestimony} submitLabel="Share my testimony">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" name="name" required autoComplete="name" />
        <Field label="Email (not published)" name="email" type="email" autoComplete="email" />
        <Field label="City / country" name="location" />
        <Field label="Title" name="title" required placeholder="e.g. Healed from…" />
      </div>
      <TextArea label="Your testimony" name="body" required rows={7} />
      <Checkbox name="is_answered_prayer" label="This is an answered prayer" />
      <Checkbox name="consent_to_publish" label={<><strong>I give permission</strong> for IT RAINS MINISTRIES to publish this testimony on its website and platforms.</>} />
      <Checkbox name="show_name" defaultChecked label="Show my name with my testimony if published" />
    </ActionForm>
  );
}
