import { Button } from "@/components/ui/Button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/Form";
import { FormStatus, Honeypot, str, useSubmit } from "./useSubmit";

export function VisitForm() {
  const { busy, result, onSubmit } = useSubmit("visitor_cards", (fd) => ({
    full_name: str(fd, "name"), email: str(fd, "email"), phone: str(fd, "phone"), planned_visit_date: str(fd, "date"),
    attending: str(fd, "attending") ?? "in_person", party_size: Number(fd.get("party") || 1), has_children: fd.get("children") === "on",
    how_heard: str(fd, "heard"), notes: str(fd, "notes"), consent_given: fd.get("consent") === "on",
  }));
  return (
    <form onSubmit={onSubmit} className="relative grid gap-5" aria-label="Plan your visit">
      <Honeypot />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" htmlFor="v-name" required><Input id="v-name" name="name" required autoComplete="name" /></Field>
        <Field label="Email" htmlFor="v-email" required><Input id="v-email" name="email" type="email" required autoComplete="email" /></Field>
        <Field label="Phone" htmlFor="v-phone"><Input id="v-phone" name="phone" type="tel" autoComplete="tel" /></Field>
        <Field label="Planned visit date" htmlFor="v-date"><Input id="v-date" name="date" type="date" /></Field>
        <Field label="Joining us" htmlFor="v-att"><Select id="v-att" name="attending" defaultValue="in_person"><option value="in_person">In person</option><option value="online">Online</option></Select></Field>
        <Field label="Number in your party" htmlFor="v-party"><Input id="v-party" name="party" type="number" min={1} max={30} defaultValue={1} /></Field>
      </div>
      <Checkbox id="v-children" name="children" label="I will bring children (we will share children’s ministry details)" />
      <Field label="How did you hear about us?" htmlFor="v-heard"><Input id="v-heard" name="heard" /></Field>
      <Field label="Anything we should know?" htmlFor="v-notes"><Textarea id="v-notes" name="notes" rows={3} /></Field>
      <Checkbox id="v-consent" name="consent" required label="I agree that the welcome team may contact me about my visit." />
      <Button type="submit" disabled={busy}>{busy ? "Sending…" : "Plan my visit"}</Button>
      <FormStatus result={result} success="Wonderful! Our welcome team will be in touch before your visit." />
    </form>
  );
}
