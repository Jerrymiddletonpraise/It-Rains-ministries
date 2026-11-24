import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Calendar, Mail, Phone, UserRound, CheckCircle2 } from "lucide-react";
import { getDepartments, getSetting } from "@/lib/data";
import { ButtonLink, Card, PageHero, Section } from "@/components/ui";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const d = (await getDepartments()).find((x) => x.slug === slug);
  return d ? { title: d.name, description: d.summary } : {};
}

export default async function Department({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [departments, contact] = await Promise.all([getDepartments(), getSetting("contact")]);
  const d = departments.find((x) => x.slug === slug);
  if (!d) notFound();
  return (
    <>
      <PageHero eyebrow="Ministry" title={d.name} intro={d.summary} />
      <Section>
        <div className="grid gap-10 lg:grid-cols-[3fr_2fr]">
          <div>
            {d.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={d.image_url} alt="" className="mb-8 aspect-video w-full rounded-3xl object-cover" />
            )}
            <h2 className="font-serif text-3xl font-bold text-royal-800">About this ministry</h2>
            <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-navy-800/85">{d.description}</p>
            <h3 className="mt-10 font-serif text-2xl font-bold">Activities</h3>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {d.activities.map((a) => <li key={a} className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm"><CheckCircle2 className="h-5 w-5 shrink-0 text-gold-600" />{a}</li>)}
            </ul>
          </div>
          <div className="space-y-5">
            <Card className="space-y-4">
              <h3 className="font-serif text-2xl font-bold">Schedule & contact</h3>
              <p className="flex gap-3"><Calendar className="shrink-0 text-gold-600" />{d.schedule || "See events"}</p>
              {d.leader_name && <p className="flex gap-3"><UserRound className="shrink-0 text-gold-600" />{d.leader_name}</p>}
              <p className="flex gap-3"><Mail className="shrink-0 text-gold-600" /><a href={`mailto:${d.contact_email || contact.email}`}>{d.contact_email || contact.email}</a></p>
              <p className="flex gap-3"><Phone className="shrink-0 text-gold-600" /><a href={`tel:${d.contact_phone || contact.phone}`}>{d.contact_phone || contact.phone}</a></p>
            </Card>
            <ButtonLink href="/contact" className="w-full">I want to get involved</ButtonLink>
            <ButtonLink href="/events" variant="purple" className="w-full">Upcoming events</ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
