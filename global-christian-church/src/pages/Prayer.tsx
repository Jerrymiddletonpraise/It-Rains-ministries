import { HandHeart } from "lucide-react";
import { useSeo } from "@/lib/seo";
import { useCollection } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { PageHero } from "@/components/ui/PageHero";
import { Section, SectionHeading } from "@/components/ui/Misc";
import { PrayerForm } from "@/components/forms/PrayerForm";
import { CareForm } from "@/components/forms/CareForm";

interface WallItem { id: string; display_name: string; category: string; request: string; created_at: string; prayer_count: number; }

export default function Prayer() {
  useSeo("Prayer Request Center", "Submit a private or public prayer request, or request pastoral care, from Global Christian Church.");
  // prayer_wall is a database view that only exposes approved public requests, never private ones.
  const wall = useCollection<WallItem>("prayer_wall", [], { order: "created_at", limit: 12 });
  return (
    <>
      <PageHero eyebrow="We will pray with you" title="Prayer Request Center" intro="Every request is received with care. Private requests are seen only by the prayer team and pastors." />
      <Section>
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-3"><h2 className="mb-8 text-4xl">Submit a prayer request</h2><PrayerForm /></div>
          <aside className="lg:col-span-2">
            <div className="card-luxe p-8 lg:hover:translate-y-0">
              <HandHeart className="h-8 w-8 text-gold" aria-hidden />
              <h2 className="mt-4 text-3xl">Your privacy matters</h2>
              <ul className="mt-4 space-y-3 text-sm text-ivory-muted">
                <li>Private requests are protected by database security rules and are visible only to the prayer team, pastors and administrators.</li>
                <li>Prayer wall requests appear publicly only after the prayer team approves them, and you can hide your name.</li>
                <li>Signed-in members can follow the status of their requests in the member portal.</li>
              </ul>
            </div>
          </aside>
        </div>
      </Section>
      <Section tone="charcoal" id="care">
        <div className="mx-auto max-w-3xl"><SectionHeading eyebrow="Pastoral care" title="Counseling, appointments and follow-up" intro="Request time with a pastor, a follow-up call, or a hospital or home visit." /><CareForm /></div>
      </Section>
      <Section>
        <SectionHeading eyebrow="Stand together" title="Prayer wall" />
        {wall.data.length ? (
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{wall.data.map((w) => <li key={w.id} className="card-luxe p-6"><p className="eyebrow text-[0.6rem]">{w.category} · {formatDate(w.created_at)}</p><p className="mt-3 text-ivory-muted">{w.request}</p><p className="mt-4 text-xs text-gold-light">{w.display_name}</p></li>)}</ul>
        ) : <p className="text-center text-ivory-muted">Approved public prayer requests will appear here.</p>}
      </Section>
    </>
  );
}
