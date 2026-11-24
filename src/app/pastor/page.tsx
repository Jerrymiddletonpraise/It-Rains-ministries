import type { Metadata } from "next";
import { getSetting } from "@/lib/data";
import { ButtonLink, PageHero, Section } from "@/components/ui";
import { LogoMark } from "@/components/ui/Logo";

export const metadata: Metadata = { title: "Meet Our Pastor" };
export const revalidate = 300;

export default async function Pastor() {
  const home = await getSetting("home");
  return (
    <>
      <PageHero eyebrow="Meet our pastor" title={home.pastor_name} intro={home.pastor_title} />
      <Section>
        <div className="grid items-start gap-12 lg:grid-cols-[2fr_3fr]">
          <div className="overflow-hidden rounded-3xl bg-heaven shadow-2xl">
            {home.pastor_photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={home.pastor_photo_url} alt={home.pastor_name} className="aspect-[4/5] w-full object-cover" />
            ) : <div className="flex aspect-[4/5] items-center justify-center"><LogoMark className="h-44 w-44" /></div>}
          </div>
          <div>
            <h2 className="font-serif text-4xl font-bold text-royal-800">A message from the pastor</h2>
            <p className="mt-5 font-serif text-2xl italic leading-relaxed text-navy-800">&ldquo;{home.pastor_message}&rdquo;</p>
            <h3 className="mt-10 font-serif text-3xl font-bold">Biography</h3>
            <p className="mt-3 whitespace-pre-line text-lg leading-relaxed text-navy-800/85">{home.pastor_bio}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/sermons?category=teaching" variant="purple">Pastor&apos;s teachings</ButtonLink>
              <ButtonLink href="/prayer?kind=counseling" variant="ghost">Request counseling</ButtonLink>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
