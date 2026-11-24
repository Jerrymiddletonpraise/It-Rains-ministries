import type { Metadata } from "next";
import { PageHero, Section } from "@/components/ui";

export const metadata: Metadata = { title: "Frequently Asked Questions" };

const FAQ = [
  ["How do I watch a live service?", "Go to the Watch Live page. When a service is on air you'll see the LIVE indicator and the video will start. You can watch on any phone, tablet or computer with no app to install. On slow connections the video adjusts automatically, and you can choose a lower quality from the player."],
  ["Do I need an account?", "No. Anyone can watch, give, submit prayer requests and register for events. Creating a free member account lets you join the live chat, see your giving history, access members-only Bible study materials and join online groups."],
  ["Is online giving secure?", "Yes. Payments are processed by Stripe and PayPal, which are certified to the highest industry security standard (PCI DSS Level 1). Your card details never touch our servers."],
  ["Will I get a receipt for my donation?", "Yes. A receipt is emailed to you once your payment is confirmed, and members can view and print all their receipts from their account."],
  ["Can I set up recurring giving?", "Yes. Choose 'Monthly' on the giving page. You can cancel at any time from your account or by contacting us."],
  ["Who sees my prayer request?", "Only our pastoral and prayer team. Requests are never published. Testimonies are only shared publicly if you give permission and a pastor has reviewed them."],
  ["How do I request counseling?", "Choose 'Request pastoral counseling' on the prayer request page and include an email or phone number. A pastor will contact you confidentially."],
  ["How do I register for an event?", "Open the event on the Events page and fill in the registration form. You'll receive a confirmation email with a link to add the event to your calendar."],
  ["How can I join a ministry department?", "Visit the Ministries page, open the department you're interested in and use its contact details, or send us a message through the Contact page."],
];

export default function Faq() {
  return (
    <>
      <PageHero eyebrow="FAQ" title="Frequently asked questions" />
      <Section>
        <div className="mx-auto max-w-3xl space-y-3">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group rounded-2xl bg-white p-6 shadow-sm ring-1 ring-navy-900/5">
              <summary className="cursor-pointer list-none font-serif text-xl font-bold text-navy-900 marker:hidden">
                <span className="flex items-center justify-between gap-4">{q}<span className="text-gold-500 transition group-open:rotate-45">+</span></span>
              </summary>
              <p className="mt-3 leading-relaxed text-navy-800/80">{a}</p>
            </details>
          ))}
        </div>
      </Section>
    </>
  );
}
