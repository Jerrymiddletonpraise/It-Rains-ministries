import type { Metadata } from "next";
import { Quote } from "lucide-react";
import { getTestimonies } from "@/lib/data";
import { Card, Empty, Heading, PageHero, Section } from "@/components/ui";
import { TestimonyForm } from "@/components/forms/TestimonyForm";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Testimonies" };
export const revalidate = 120;

export default async function Testimonies() {
  const items = await getTestimonies(60);
  return (
    <>
      <PageHero eyebrow="Testimonies" title="Transformed lives" intro="“They overcame him by the blood of the Lamb, and by the word of their testimony.” Revelation 12:11" />
      <Section>
        {items.length ? (
          <div className="columns-1 gap-6 md:columns-2 lg:columns-3">
            {items.map((t) => (
              <Card key={t.id} className="mb-6 break-inside-avoid">
                <Quote className="h-7 w-7 text-gold-500" />
                {t.is_answered_prayer && <span className="mt-3 inline-block rounded-full bg-royal-100 px-3 py-1 text-xs font-semibold text-royal-800">Answered prayer</span>}
                <h2 className="mt-3 font-serif text-2xl font-bold">{t.title}</h2>
                <p className="mt-2 whitespace-pre-line text-navy-800/85">{t.body}</p>
                <p className="mt-4 text-sm font-semibold text-royal-700">{t.show_name ? t.name : "A grateful believer"}{t.location ? ` · ${t.location}` : ""}</p>
                <p className="text-xs text-navy-800/50">{formatDate(t.created_at)}</p>
              </Card>
            ))}
          </div>
        ) : <Empty title="Testimonies will appear here">Share what God has done and encourage someone today.</Empty>}
      </Section>
      <Section className="bg-white" id="share">
        <div className="mx-auto max-w-3xl">
          <Heading center eyebrow="Share your story" title="What has God done for you?" intro="Share a testimony or an answered prayer. We only publish with your permission, after a pastor reviews it." />
          <TestimonyForm />
        </div>
      </Section>
    </>
  );
}
