import { Button } from "@/components/ui/Button";
import { Checkbox, Field, Input, Textarea } from "@/components/ui/Form";
import { useAuth } from "@/auth/AuthProvider";
import { FormStatus, Honeypot, str, useSubmit } from "./useSubmit";

export function TestimonyForm() {
  const { user } = useAuth();
  const { busy, result, onSubmit } = useSubmit("testimonials", (fd) => ({
    submitted_by: user?.id ?? null, author_name: str(fd, "name"), email: str(fd, "email"), location: str(fd, "location"),
    title: str(fd, "title"), body: str(fd, "body"), consent_to_publish: fd.get("consent") === "on",
  }));
  return (
    <form onSubmit={onSubmit} className="relative grid gap-5" aria-label="Share your testimony">
      <Honeypot />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name to display" htmlFor="t-name" required><Input id="t-name" name="name" required /></Field>
        <Field label="Email (not published)" htmlFor="t-email"><Input id="t-email" name="email" type="email" /></Field>
        <Field label="Title" htmlFor="t-title"><Input id="t-title" name="title" /></Field>
        <Field label="City or country" htmlFor="t-loc"><Input id="t-loc" name="location" /></Field>
      </div>
      <Field label="Your testimony" htmlFor="t-body" required><Textarea id="t-body" name="body" required maxLength={5000} rows={6} /></Field>
      <Checkbox id="t-consent" name="consent" required label="I give Global Christian Church permission to publish my testimony after review." />
      <Button type="submit" disabled={busy}>{busy ? "Sending…" : "Share testimony"}</Button>
      <FormStatus result={result} success="Thank you for sharing! Your testimony will appear after it has been reviewed." />
    </form>
  );
}
