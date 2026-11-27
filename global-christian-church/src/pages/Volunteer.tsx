import { useSeo } from "@/lib/seo";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Misc";
import { VolunteerForm } from "@/components/forms/VolunteerForm";

export default function Volunteer() {
  useSeo("Volunteer Registration", "Serve with Global Christian Church. Register as a volunteer.");
  return (
    <>
      <PageHero eyebrow="Serve with us" title="Volunteer Registration" intro="Use your gifts to serve the church family and the world." />
      <Section><div className="mx-auto max-w-4xl"><VolunteerForm /></div></Section>
    </>
  );
}
