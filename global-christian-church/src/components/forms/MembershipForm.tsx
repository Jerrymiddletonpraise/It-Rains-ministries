import { Button, ButtonLink } from "@/components/ui/Button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/Form";
import { Notice } from "@/components/ui/Misc";
import { useAuth } from "@/auth/AuthProvider";
import { demoMinistries } from "@/lib/demo";
import { FormStatus, str, useSubmit } from "./useSubmit";

export function MembershipForm() {
  const { user, configured, profile } = useAuth();
  const { busy, result, onSubmit } = useSubmit("membership_applications", (fd) => ({
    user_id: user?.id, full_name: str(fd, "name"), phone: str(fd, "phone"), date_of_birth: str(fd, "dob"),
    address: str(fd, "address"), city: str(fd, "city"), country: str(fd, "country"), marital_status: str(fd, "marital"),
    is_baptized: fd.get("baptized") === "on", salvation_testimony: str(fd, "testimony"),
    ministry_interests: fd.getAll("interests"), consent_given: fd.get("consent") === "on",
  }));

  if (!configured) return <Notice tone="warn" title="Awaiting configuration">Membership applications open once the church database is connected. Nothing can be submitted yet.</Notice>;
  if (!user) {
    return (
      <div className="rounded-2xl border border-line p-8 text-center">
        <p className="font-display text-2xl">Create your account first</p>
        <p className="mt-2 text-sm text-ivory-muted">Membership is linked to your secure member account so you can follow your application and use the member portal.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3"><ButtonLink to="/register">Create account</ButtonLink><ButtonLink to="/login" variant="outline">Sign in</ButtonLink></div>
      </div>
    );
  }
  return (
    <form onSubmit={onSubmit} className="grid gap-5" aria-label="Membership application">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" htmlFor="m-name" required><Input id="m-name" name="name" required defaultValue={profile?.full_name ?? ""} autoComplete="name" /></Field>
        <Field label="Phone" htmlFor="m-phone"><Input id="m-phone" name="phone" type="tel" defaultValue={profile?.phone ?? ""} autoComplete="tel" /></Field>
        <Field label="Date of birth" htmlFor="m-dob"><Input id="m-dob" name="dob" type="date" /></Field>
        <Field label="Marital status" htmlFor="m-marital"><Select id="m-marital" name="marital" defaultValue=""><option value="">Prefer not to say</option><option value="single">Single</option><option value="married">Married</option><option value="widowed">Widowed</option><option value="divorced">Divorced</option></Select></Field>
        <Field label="Street address" htmlFor="m-address" className="sm:col-span-2"><Input id="m-address" name="address" autoComplete="street-address" /></Field>
        <Field label="City" htmlFor="m-city"><Input id="m-city" name="city" defaultValue={profile?.city ?? ""} autoComplete="address-level2" /></Field>
        <Field label="Country" htmlFor="m-country"><Input id="m-country" name="country" defaultValue={profile?.country ?? ""} autoComplete="country-name" /></Field>
      </div>
      <Checkbox id="m-bapt" name="baptized" label="I have been baptized" />
      <Field label="Share a little about your faith journey" htmlFor="m-test"><Textarea id="m-test" name="testimony" maxLength={4000} /></Field>
      <fieldset>
        <legend className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-ivory-muted">Ministries I am interested in</legend>
        <div className="grid gap-2 sm:grid-cols-2">{demoMinistries.map((m) => <Checkbox key={m.slug} id={`mi-${m.slug}`} name="interests" value={m.slug} label={m.name} />)}</div>
      </fieldset>
      <Checkbox id="m-consent" name="consent" required label="I agree that Global Christian Church may store these details for membership care, as described in the Privacy Policy." />
      <Button type="submit" disabled={busy} size="lg">{busy ? "Submitting…" : "Submit membership application"}</Button>
      <FormStatus result={result} success="Your application has been received. A church administrator will follow up with next steps." />
    </form>
  );
}
