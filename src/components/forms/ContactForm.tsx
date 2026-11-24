"use client";
import { submitContact } from "@/app/actions/public";
import { ActionForm } from "./ActionForm";
import { Field, Select, TextArea } from "@/components/ui";

export function ContactForm({ defaultKind = "contact" }: { defaultKind?: "contact" | "greeting" }) {
  return (
    <ActionForm action={submitContact} submitLabel="Send message">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" name="name" required autoComplete="name" />
        <Field label="Email" name="email" type="email" required autoComplete="email" />
        <Field label="Phone (optional)" name="phone" type="tel" autoComplete="tel" />
        <Select label="I'm sending" name="kind" defaultValue={defaultKind}>
          <option value="contact">A message or question</option>
          <option value="greeting">A greeting to the ministry</option>
        </Select>
      </div>
      <Field label="Subject" name="subject" />
      <TextArea label="Message" name="message" required rows={6} />
    </ActionForm>
  );
}
