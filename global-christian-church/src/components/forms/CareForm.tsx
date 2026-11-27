import { Button } from "@/components/ui/Button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/Form";
import { useAuth } from "@/auth/AuthProvider";
import { FormStatus, Honeypot, str, useSubmit } from "./useSubmit";

export function CareForm() {
  const { user } = useAuth();
  const { busy, result, onSubmit } = useSubmit("pastoral_care_requests", (fd) => ({
    requester_id: user?.id ?? null, name: str(fd, "name"), email: str(fd, "email"), phone: str(fd, "phone"),
    request_type: str(fd, "type") ?? "counseling", preferred_times: str(fd, "times"), details: str(fd, "details"),
    consent_given: fd.get("consent") === "on",
  }));
  return (
    <form onSubmit={onSubmit} className="relative grid gap-5" aria-label="Pastoral care request">
      <Honeypot />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" htmlFor="pc-name" required><Input id="pc-name" name="name" required autoComplete="name" /></Field>
        <Field label="Request type" htmlFor="pc-type">
          <Select id="pc-type" name="type" defaultValue="counseling">
            <option value="counseling">Pastoral counseling</option><option value="appointment">Appointment with a pastor</option>
            <option value="follow_up">Follow-up visit or call</option><option value="hospital_visit">Hospital or home visit</option>
          </Select>
        </Field>
        <Field label="Email" htmlFor="pc-email" required><Input id="pc-email" name="email" type="email" required autoComplete="email" /></Field>
        <Field label="Phone" htmlFor="pc-phone"><Input id="pc-phone" name="phone" type="tel" autoComplete="tel" /></Field>
      </div>
      <Field label="Preferred days and times" htmlFor="pc-times"><Input id="pc-times" name="times" /></Field>
      <Field label="How can we help?" htmlFor="pc-details" hint="Kept strictly confidential to the pastoral team."><Textarea id="pc-details" name="details" maxLength={4000} /></Field>
      <Checkbox id="pc-consent" name="consent" required label="I agree that the pastoral team may store and use these details to contact me." />
      <Button type="submit" disabled={busy}>{busy ? "Sending…" : "Request pastoral care"}</Button>
      <FormStatus result={result} success="Thank you. A member of the pastoral team will reach out to you." />
    </form>
  );
}
