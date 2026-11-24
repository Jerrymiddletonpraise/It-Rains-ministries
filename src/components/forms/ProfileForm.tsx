"use client";
import { updateProfile } from "@/app/actions/member";
import { ActionForm } from "./ActionForm";
import { Checkbox, Field, TextArea } from "@/components/ui";

type P = { full_name?: string | null; phone?: string | null; country?: string | null; city?: string | null; bio?: string | null; newsletter_opt_in?: boolean };
export function ProfileForm({ profile, email }: { profile: P; email: string }) {
  return (
    <ActionForm action={updateProfile} submitLabel="Save profile" resetOnSuccess={false} protect={false}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" name="full_name" required defaultValue={profile.full_name ?? ""} />
        <Field label="Email" name="email_display" disabled value={email} readOnly />
        <Field label="Phone" name="phone" defaultValue={profile.phone ?? ""} />
        <Field label="Country" name="country" defaultValue={profile.country ?? ""} />
        <Field label="City" name="city" defaultValue={profile.city ?? ""} />
      </div>
      <TextArea label="About me" name="bio" rows={3} defaultValue={profile.bio ?? ""} />
      <Checkbox name="newsletter_opt_in" defaultChecked={profile.newsletter_opt_in} label="Receive ministry announcements and newsletters" />
    </ActionForm>
  );
}
