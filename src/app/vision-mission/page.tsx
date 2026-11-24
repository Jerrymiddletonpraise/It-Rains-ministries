import type { Metadata } from "next";
import { Eye, Target, Sparkles } from "lucide-react";
import { getSetting } from "@/lib/data";
import { Card, PageHero, Section } from "@/components/ui";

export const metadata: Metadata = { title: "Our Vision and Mission" };
export const revalidate = 300;

export default async function VisionMission() {
  const about = await getSetting("about");
  return (
    <>
      <PageHero eyebrow="Vision & mission" title="Why we exist" intro="Called to bring the abundance of heaven to every life and every nation." />
      <Section>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-10"><Eye className="h-10 w-10 text-gold-500" /><h2 className="mt-4 font-serif text-4xl font-bold text-royal-800">Our Vision</h2><p className="mt-4 text-xl leading-relaxed text-navy-800/85">{about.vision}</p></Card>
          <Card className="p-10"><Target className="h-10 w-10 text-gold-500" /><h2 className="mt-4 font-serif text-4xl font-bold text-royal-800">Our Mission</h2><p className="mt-4 text-xl leading-relaxed text-navy-800/85">{about.mission}</p></Card>
        </div>
        <div className="mt-12">
          <h2 className="mb-6 flex items-center gap-3 font-serif text-3xl font-bold"><Sparkles className="text-gold-500" />Our core values</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {about.values.map((v, i) => (
              <div key={v} className="flex items-center gap-4 rounded-2xl bg-navy-900 p-6 text-white">
                <span className="font-serif text-4xl font-bold text-gold-500">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-serif text-xl">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
