import { Button } from "@/components/ui/Button";
import { Checkbox, Input } from "@/components/ui/Form";
import { FormStatus, Honeypot, str, useSubmit } from "./useSubmit";

export function NewsletterForm({ compact }: { compact?: boolean }) {
  const id = compact ? "nl-footer" : "nl-main";
  const { busy, result, onSubmit } = useSubmit("newsletter_subscriptions", (fd) => ({
    email: str(fd, "email")?.toLowerCase(), full_name: str(fd, "full_name"), consent_given: fd.get("consent") === "on", source: compact ? "footer" : "homepage",
  }));
  return (
    <form onSubmit={onSubmit} className="relative space-y-3" aria-label="Newsletter subscription">
      <Honeypot />
      {!compact && <Input name="full_name" placeholder="Your name" aria-label="Your name" autoComplete="name" />}
      <div className={compact ? "space-y-3" : "flex flex-col gap-3 sm:flex-row"}>
        <Input name="email" type="email" required placeholder="Email address" aria-label="Email address" autoComplete="email" />
        <Button type="submit" disabled={busy} className={compact ? "w-full" : ""}>{busy ? "Subscribing…" : "Subscribe"}</Button>
      </div>
      <Checkbox id={`${id}-consent`} name="consent" required label="I agree to receive emails from Global Christian Church and can unsubscribe at any time." />
      <FormStatus result={result} success="Thank you for subscribing. You can unsubscribe at any time." />
    </form>
  );
}
