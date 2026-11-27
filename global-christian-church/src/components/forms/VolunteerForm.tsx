import { Button } from "@/components/ui/Button";
import { Checkbox, Field, Input, Textarea } from "@/components/ui/Form";
import { useAuth } from "@/auth/AuthProvider";
import { FormStatus, Honeypot, str, useSubmit } from "./useSubmit";

const AREAS = ["Welcome and hospitality", "Children’s ministry", "Youth ministry", "Worship and music", "Media and live stream", "Prayer team", "Community outreach", "Events and setup", "Administration"];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function VolunteerForm() {
  const { user } = useAuth();
  const { busy, result, onSubmit } = useSubmit("volunteer_applications", (fd) => ({
    user_id: user?.id ?? null, full_name: str(fd, "name"), email: str(fd, "email"), phone: str(fd, "phone"),
    areas: fd.getAll("areas"), availability: fd.getAll("days"), skills: str(fd, "skills"), experience: str(fd, "experience"),
    ministry_slug: str(fd, "ministry"), consent_given: fd.get("consent") === "on",
  }));
  return (
    <form onSubmit={onSubmit} className="relative grid gap-5" aria-label="Volunteer registration">
      <Honeypot />
      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Full name" htmlFor="vo-name" required><Input id="vo-name" name="name" required autoComplete="name" /></Field>
        <Field label="Email" htmlFor="vo-email" required><Input id="vo-email" name="email" type="email" required autoComplete="email" /></Field>
        <Field label="Phone" htmlFor="vo-phone"><Input id="vo-phone" name="phone" type="tel" autoComplete="tel" /></Field>
      </div>
      <fieldset><legend className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-ivory-muted">Where would you like to serve?</legend>
        <div className="grid gap-2 sm:grid-cols-3">{AREAS.map((a) => <Checkbox key={a} id={`va-${a}`} name="areas" value={a} label={a} />)}</div></fieldset>
      <fieldset><legend className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-ivory-muted">Availability</legend>
        <div className="flex flex-wrap gap-4">{DAYS.map((d) => <Checkbox key={d} id={`vd-${d}`} name="days" value={d} label={d} />)}</div></fieldset>
      <input type="hidden" name="ministry" value="" />
      <Field label="Skills and gifts" htmlFor="vo-skills"><Input id="vo-skills" name="skills" placeholder="Music, design, teaching, hospitality…" /></Field>
      <Field label="Previous experience" htmlFor="vo-exp"><Textarea id="vo-exp" name="experience" rows={3} /></Field>
      <p className="text-xs text-ivory-muted">Some roles, such as children’s and youth ministry, may require a background check in line with church safeguarding policy.</p>
      <Checkbox id="vo-consent" name="consent" required label="I agree that ministry leaders may contact me about serving." />
      <Button type="submit" disabled={busy}>{busy ? "Sending…" : "Register to volunteer"}</Button>
      <FormStatus result={result} success="Thank you for your heart to serve! A ministry leader will contact you." />
    </form>
  );
}
