import type { Metadata } from "next";
import { getSetting, getDepartments } from "@/lib/data";
import { ButtonLink, Card, Heading, PageHero, Section } from "@/components/ui";
import { DepartmentCard } from "@/components/cards";

export const metadata: Metadata = { title: "About Us", description: "The story, beliefs and heart of IT RAINS MINISTRIES." };
export const revalidate = 300;

const BELIEFS = [
  ["The Bible", "We believe the Scriptures are the inspired, infallible Word of God and our final authority for faith and life."],
  ["The Godhead", "We believe in one God, eternally existing as Father, Son and Holy Spirit."],
  ["Salvation", "We believe salvation is by grace through faith in the finished work of Jesus Christ on the cross."],
  ["The Holy Spirit", "We believe in the baptism and gifts of the Holy Spirit for empowered Christian living and service."],
  ["The Church", "We believe the Church is the body of Christ, called to worship, make disciples and serve the world."],
  ["His Return", "We believe in the personal, glorious return of the Lord Jesus Christ."],
];

export default async function About() {
  const [about, departments] = await Promise.all([getSetting("about"), getDepartments()]);
  return (
    <>
      <PageHero eyebrow="About us" title="A ministry where heaven meets earth" intro="Where Heaven's Abundance Rains Upon Lives." />
      <Section>
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <Heading eyebrow="Our story" title="From a prayer meeting to the nations" />
            <p className="whitespace-pre-line text-lg leading-relaxed text-navy-800/85">{about.story}</p>
            <div className="mt-8 flex flex-wrap gap-3"><ButtonLink href="/vision-mission" variant="purple">Vision & mission</ButtonLink><ButtonLink href="/pastor" variant="ghost">Meet our pastor</ButtonLink></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {about.values.map((v) => (
              <Card key={v} className="border-l-4 border-l-gold-500"><p className="font-serif text-xl font-bold text-royal-800">{v}</p></Card>
            ))}
          </div>
        </div>
      </Section>
      <Section className="bg-white">
        <Heading center eyebrow="What we believe" title="Our statement of faith" />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {BELIEFS.map(([t, b]) => <Card key={t}><h3 className="font-serif text-2xl font-bold text-royal-800">{t}</h3><p className="mt-2 text-navy-800/80">{b}</p></Card>)}
        </div>
      </Section>
      <Section className="bg-heaven">
        <Heading light center eyebrow="Our ministries" title="Serving every season of life" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{departments.slice(0, 6).map((d) => <DepartmentCard key={d.slug} d={d} />)}</div>
      </Section>
    </>
  );
}
