import type { Metadata } from "next";
import { PageHero, Section } from "@/components/ui";
import { getSetting } from "@/lib/data";

export const metadata: Metadata = { title: "Terms and Conditions" };

export default async function Terms() {
  const contact = await getSetting("contact");
  return (
    <>
      <PageHero title="Terms & Conditions" intro="Last updated: November 2026" />
      <Section>
        <article className="prose-irm mx-auto max-w-3xl text-navy-800/90">
          <p>By using the IT RAINS MINISTRIES website and services you agree to these terms. Please have them reviewed by a qualified advisor for your country before launch.</p>
          <h2>Use of the site</h2>
          <p>Use the site lawfully and respectfully. Do not post abusive, hateful, sexual, misleading or commercial content, impersonate others, or attempt to disrupt the platform.</p>
          <h2>Accounts</h2>
          <p>You are responsible for keeping your login details secure. We may suspend accounts that break these terms.</p>
          <h2>Live chat & community</h2>
          <p>Live chat and group discussions are moderated. Moderators may hide messages or restrict users who post spam or inappropriate content.</p>
          <h2>Giving</h2>
          <p>Gifts are voluntary contributions to the ministry and are generally non-refundable. If you believe a payment was made in error, contact us within 30 days. Recurring gifts can be cancelled at any time. Tax deductibility depends on your country and the ministry&apos;s registration status.</p>
          <h2>Content</h2>
          <p>Sermons, music, videos and resources are owned by IT RAINS MINISTRIES or used with permission. You may share links and use downloadable resources for personal and church use, but not resell them.</p>
          <h2>Submissions</h2>
          <p>By submitting a testimony with consent to publish, you grant us permission to share it on our platforms. You can withdraw that permission at any time.</p>
          <h2>Disclaimer</h2>
          <p>Pastoral counseling offered through the site is spiritual guidance and is not a substitute for professional medical, legal or psychological advice. In an emergency, contact your local emergency services.</p>
          <h2>Changes & contact</h2>
          <p>We may update these terms from time to time. Questions: <a className="text-royal-700 underline" href={`mailto:${contact.email}`}>{contact.email}</a>.</p>
        </article>
      </Section>
    </>
  );
}
