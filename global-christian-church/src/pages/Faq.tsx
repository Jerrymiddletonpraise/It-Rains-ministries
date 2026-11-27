import { useSeo } from "@/lib/seo";
import { useCollection } from "@/lib/data";
import { demoFaqs } from "@/lib/demo";
import type { Faq as FaqT } from "@/lib/types";
import { PageHero } from "@/components/ui/PageHero";
import { DemoBadge, Section } from "@/components/ui/Misc";

export default function Faq() {
  useSeo("Frequently Asked Questions", "Answers to common questions about Global Christian Church.");
  const f = useCollection<FaqT>("faqs", demoFaqs, { eq: { is_published: true }, order: "sort_order", ascending: true });
  return (
    <>
      <PageHero eyebrow="Help" title="Frequently Asked Questions" />
      <Section>
        <div className="mx-auto max-w-3xl">
          {f.isDemo && <DemoBadge className="mb-6" label="Starter answers, editable" />}
          <div className="divide-y divide-line rounded-2xl border border-line">
            {f.data.map((q) => (
              <details key={q.id} className="group p-6 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-2xl">{q.question}<span className="text-gold transition group-open:rotate-45" aria-hidden>+</span></summary>
                <p className="mt-4 leading-relaxed text-ivory-muted">{q.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
