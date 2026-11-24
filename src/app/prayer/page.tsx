import type { Metadata } from "next";
import { HandHeart, ShieldCheck, Phone } from "lucide-react";
import { Card, PageHero, Section, ButtonLink } from "@/components/ui";
import { PrayerForm } from "@/components/forms/PrayerForm";

export const metadata: Metadata = { title: "Prayer Request", description: "Submit a private prayer request, request counseling or follow-up from IT RAINS MINISTRIES." };

export default async function Prayer({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const { kind } = await searchParams;
  return (
    <>
      <PageHero eyebrow="Prayer request" title="You don't have to carry it alone" intro="“Is any among you afflicted? Let him pray.” James 5:13" />
      <Section>
        <div className="grid gap-10 lg:grid-cols-[3fr_2fr]">
          <Card className="p-6 md:p-10">
            <h2 className="mb-6 font-serif text-3xl font-bold">Share your request</h2>
            <PrayerForm defaultKind={["prayer", "urgent", "counseling", "followup"].includes(kind ?? "") ? kind : "prayer"} />
          </Card>
          <div className="space-y-5">
            <Card><ShieldCheck className="h-8 w-8 text-gold-600" /><h3 className="mt-3 font-serif text-2xl font-bold">Private & confidential</h3><p className="mt-2 text-navy-800/80">Requests are only visible to our pastoral and intercession team. They are never published.</p></Card>
            <Card><HandHeart className="h-8 w-8 text-gold-600" /><h3 className="mt-3 font-serif text-2xl font-bold">Prayed over daily</h3><p className="mt-2 text-navy-800/80">Our intercessors pray over every request. Urgent requests are flagged to the prayer chain immediately.</p></Card>
            <Card><Phone className="h-8 w-8 text-gold-600" /><h3 className="mt-3 font-serif text-2xl font-bold">In crisis?</h3><p className="mt-2 text-navy-800/80">If you or someone else is in immediate danger, please contact your local emergency services right away.</p></Card>
            <ButtonLink href="/testimonies#share" variant="purple" className="w-full">Share an answered prayer</ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
