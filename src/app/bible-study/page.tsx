import type { Metadata } from "next";
import { BookOpen, Users, Calendar } from "lucide-react";
import { getMedia } from "@/lib/data";
import { getSession } from "@/lib/auth";
import { ButtonLink, Card, Empty, Heading, PageHero, Section } from "@/components/ui";
import { SermonCard } from "@/components/cards";

export const metadata: Metadata = { title: "Bible Study" };
export const dynamic = "force-dynamic";

export default async function BibleStudy() {
  const [studies, resources, session] = await Promise.all([getMedia({ category: "bible_study", limit: 9 }), getMedia({ category: "resource", limit: 6 }), getSession()]);
  return (
    <>
      <PageHero eyebrow="Bible study" title="Grow deep in the Word" intro="“Study to shew thyself approved unto God.” 2 Timothy 2:15" />
      <Section>
        <div className="grid gap-5 md:grid-cols-3">
          <Card><Calendar className="h-8 w-8 text-gold-600" /><h3 className="mt-3 font-serif text-2xl font-bold">Wednesdays, live</h3><p className="mt-2 text-navy-800/80">Join our midweek Bible study in person or on the Watch Live page.</p><ButtonLink href="/watch" variant="ghost" className="mt-4 px-0">Watch live →</ButtonLink></Card>
          <Card><Users className="h-8 w-8 text-gold-600" /><h3 className="mt-3 font-serif text-2xl font-bold">Online study groups</h3><p className="mt-2 text-navy-800/80">Members can join small groups to discuss the Word and pray together.</p><ButtonLink href={session.user ? "/account/groups" : "/register"} variant="ghost" className="mt-4 px-0">{session.user ? "Browse groups →" : "Become a member →"}</ButtonLink></Card>
          <Card><BookOpen className="h-8 w-8 text-gold-600" /><h3 className="mt-3 font-serif text-2xl font-bold">Study materials</h3><p className="mt-2 text-navy-800/80">Download outlines, devotionals and study guides. Some materials are for members only.</p></Card>
        </div>
      </Section>
      <Section className="bg-white">
        <Heading eyebrow="Recordings" title="Recent Bible studies" />
        {studies.length ? <div className="grid gap-6 md:grid-cols-3">{studies.map((m) => <SermonCard key={m.id} m={m} />)}</div> : <Empty title="Bible study recordings are coming soon" />}
      </Section>
      <Section>
        <Heading eyebrow="Downloads" title="Study resources" />
        {resources.length ? <div className="grid gap-6 md:grid-cols-3">{resources.map((m) => <SermonCard key={m.id} m={m} />)}</div> : <Empty title="Resources will be added soon" />}
        {!session.user && <p className="mt-8 text-center text-navy-800/70">Members see additional study materials. <a href="/register" className="font-semibold text-royal-700">Create a free account</a></p>}
      </Section>
    </>
  );
}
