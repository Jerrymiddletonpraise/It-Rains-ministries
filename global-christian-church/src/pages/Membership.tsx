import { useSeo } from "@/lib/seo";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Misc";
import { MembershipForm } from "@/components/forms/MembershipForm";

export default function Membership() {
  useSeo("Become a Member", "Join the Global Christian Church family as a member.");
  return (
    <>
      <PageHero eyebrow="Join the family" title="Become a Member" intro="Take your next step and make Global Christian Church your church home." />
      <Section>
        <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-3">
          <ol className="space-y-6 lg:col-span-1">
            {[["Create your account", "Your secure member account keeps your information private."], ["Complete the application", "Tell us about yourself and the ministries you are interested in."], ["Meet with the church", "An administrator will contact you about next steps."]].map(([t, b], i) => (
              <li key={t} className="flex gap-4"><span className="font-display text-4xl text-gold">{i + 1}</span><div><p className="font-semibold">{t}</p><p className="text-sm text-ivory-muted">{b}</p></div></li>
            ))}
          </ol>
          <div className="lg:col-span-2"><MembershipForm /></div>
        </div>
      </Section>
    </>
  );
}
