import { Button } from "@/components/ui/Button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/Form";
import { FormStatus, Honeypot, str, useSubmit } from "./useSubmit";

export function ContactForm() {
  const { busy, result, onSubmit } = useSubmit("contact_messages", (fd) => ({
    name: str(fd, "name"), email: str(fd, "email"), phone: str(fd, "phone"), topic: str(fd, "topic") ?? "general", message: str(fd, "message"), consent_given: fd.get("consent") === "on",
  }));
  return (
    <form onSubmit={onSubmit} className="relative grid gap-5" aria-label="Contact form">
      <Honeypot />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" htmlFor="c-name" required><Input id="c-name" name="name" required autoComplete="name" /></Field>
        <Field label="Email" htmlFor="c-email" required><Input id="c-email" name="email" type="email" required autoComplete="email" /></Field>
        <Field label="Phone" htmlFor="c-phone"><Input id="c-phone" name="phone" type="tel" autoComplete="tel" /></Field>
        <Field label="Topic" htmlFor="c-topic">
          <Select id="c-topic" name="topic" defaultValue="general">
            <option value="general">General question</option><option value="visit">Planning a visit</option><option value="ministries">Ministries</option>
            <option value="giving">Giving</option><option value="media">Media and live stream</option><option value="other">Something else</option>
          </Select>
        </Field>
      </div>
      <Field label="Message" htmlFor="c-msg" required><Textarea id="c-msg" name="message" required maxLength={5000} /></Field>
      <Checkbox id="c-consent" name="consent" required label="I agree that Global Christian Church may store my details to respond to this message." />
      <Button type="submit" disabled={busy}>{busy ? "Sending…" : "Send message"}</Button>
      <FormStatus result={result} success="Thank you for reaching out. We will reply as soon as we can." />
    </form>
  );
}
