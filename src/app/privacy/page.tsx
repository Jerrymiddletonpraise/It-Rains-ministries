import type { Metadata } from "next";
import { PageHero, Section } from "@/components/ui";
import { getSetting } from "@/lib/data";

export const metadata: Metadata = { title: "Privacy Policy" };

export default async function Privacy() {
  const contact = await getSetting("contact");
  return (
    <>
      <PageHero title="Privacy Policy" intro="Last updated: November 2026" />
      <Section>
        <article className="prose-irm mx-auto max-w-3xl text-navy-800/90">
          <p>IT RAINS MINISTRIES (&ldquo;we&rdquo;, &ldquo;us&rdquo;) respects your privacy. This policy explains what information we collect, why, and the choices you have. Please have this policy reviewed by a qualified advisor for your country before launch.</p>
          <h2>Information we collect</h2>
          <ul>
            <li><strong>Account details</strong> you provide when registering: name, email, phone, country and profile information.</li>
            <li><strong>Prayer requests, counseling requests and testimonies</strong> you submit. These are treated as sensitive and are visible only to authorised pastoral staff.</li>
            <li><strong>Giving records</strong>: amount, fund, date and the payment reference. Card and bank details are handled by Stripe or PayPal and are never stored on our servers.</li>
            <li><strong>Event registrations, contact messages, newsletter subscriptions and live chat messages.</strong></li>
            <li><strong>Usage data</strong>: anonymous page view counts (page, referring site, country, device type) without cookies or IP addresses. With your consent, Google Analytics cookies.</li>
          </ul>
          <h2>How we use it</h2>
          <p>To provide ministry services; pray for and follow up with you when you ask us to; process gifts and issue receipts; send confirmations and, if you subscribed, newsletters; keep the platform secure and prevent spam; and understand how the site is used so we can improve it.</p>
          <h2>Testimonies</h2>
          <p>We will only publish a testimony if you explicitly consent and a pastor has reviewed it. You can ask us to remove it at any time.</p>
          <h2>Sharing</h2>
          <p>We do not sell your data. We share it only with service providers that help us operate: Supabase (database and authentication), Stripe and PayPal (payments), Resend (email), LiveKit (live video) and Vercel (hosting), each under their own data protection terms, or where required by law.</p>
          <h2>Cookies</h2>
          <p>Essential cookies keep you signed in and protect forms. Analytics cookies are only set if you choose &ldquo;Accept all&rdquo;. You can change your choice any time using &ldquo;Cookie Settings&rdquo; in the footer.</p>
          <h2>Your rights</h2>
          <p>You may access, correct or delete your personal data, unsubscribe from emails, and withdraw consent. Members can update their profile from their account. For anything else, contact us.</p>
          <h2>Security & retention</h2>
          <p>Data is encrypted in transit (HTTPS) and protected with role-based access controls. We keep data only as long as needed for ministry, legal and financial-record purposes.</p>
          <h2>Children</h2>
          <p>Children under 13 should use the site with a parent or guardian. We do not knowingly collect children&apos;s data without parental consent.</p>
          <h2>Contact</h2>
          <p>Email <a className="text-royal-700 underline" href={`mailto:${contact.email}`}>{contact.email}</a> with any privacy questions.</p>
        </article>
      </Section>
    </>
  );
}
