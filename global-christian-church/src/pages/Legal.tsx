import type { ReactNode } from "react";
import { useSeo } from "@/lib/seo";
import { PageHero } from "@/components/ui/PageHero";
import { Notice, Section } from "@/components/ui/Misc";

function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <PageHero eyebrow="Legal" title={title} />
      <Section>
        <div className="mx-auto max-w-3xl">
          <Notice tone="warn" title="Template awaiting review">This is a starting template. Church leadership should review it with qualified legal counsel and add the church’s legal name, address and jurisdiction before relying on it.</Notice>
          <div className="prose-luxe mt-10">{children}</div>
        </div>
      </Section>
    </>
  );
}

export function Privacy() {
  useSeo("Privacy Policy", "How Global Christian Church collects, uses and protects personal information.");
  return (
    <LegalPage title="Privacy Policy">
      <p>Global Christian Church (“the church”, “we”) respects your privacy. This policy explains what information this website collects and how it is used.</p>
      <h2>Information we collect</h2>
      <ul>
        <li>Account details you provide, such as your name, email address, phone number and profile information.</li>
        <li>Information you submit through forms, including prayer requests, pastoral care requests, membership and volunteer applications, visitor cards, testimonies and contact messages.</li>
        <li>Giving records, such as amount, date, category and receipt details. Card and bank details are handled by our payment processors (Stripe and PayPal) and are never stored by the church.</li>
        <li>Technical information needed to run the site securely, such as sign-in session data.</li>
      </ul>
      <h2>How we use information</h2>
      <ul>
        <li>To provide ministry care, respond to requests and manage membership, events and volunteering.</li>
        <li>To process gifts and send receipts.</li>
        <li>To send newsletters, reminders and notifications only where you have given consent. You can withdraw consent at any time.</li>
      </ul>
      <h2>Prayer and pastoral care</h2>
      <p>Private prayer requests and pastoral care requests are confidential. Access is restricted by database security rules to the prayer team, pastors and authorised administrators. Public prayer wall requests are shown only after review, and you may choose to hide your name.</p>
      <h2>Sharing</h2>
      <p>We do not sell personal information. We share it only with service providers that help us run the website (such as hosting, database, email and payment providers) and only as needed to provide those services, or where required by law.</p>
      <h2>Security and retention</h2>
      <p>We use access controls, encryption in transit and role-based permissions to protect your information. We keep information only as long as needed for ministry and legal purposes.</p>
      <h2>Your choices</h2>
      <p>You can view and update your profile in the member portal, unsubscribe from communications, and ask us to correct or delete your information by contacting the church.</p>
      <h2>Children</h2>
      <p>Accounts are intended for adults. Information about children is collected only from a parent or guardian, for example during event or ministry registration.</p>
      <h2>Changes</h2>
      <p>We may update this policy. The latest version will always be published on this page.</p>
    </LegalPage>
  );
}

export function Terms() {
  useSeo("Terms and Conditions", "Terms for using the Global Christian Church website and member portal.");
  return (
    <LegalPage title="Terms and Conditions">
      <p>By using this website and member portal you agree to these terms.</p>
      <h2>Use of the website</h2>
      <ul>
        <li>Use the site respectfully and lawfully. Do not post harmful, abusive or misleading content, including in live chat, testimonies or prayer requests.</li>
        <li>You are responsible for keeping your account password secure.</li>
        <li>The church may moderate, remove content or suspend accounts that break these terms.</li>
      </ul>
      <h2>Content</h2>
      <p>Sermons, recordings, artwork and resources on this site belong to Global Christian Church or their respective owners and are provided for personal, non-commercial use unless stated otherwise. Scripture quotations are from public-domain translations unless noted.</p>
      <h2>Giving</h2>
      <p>Gifts are processed by Stripe or PayPal. Recurring gifts can be changed or cancelled at any time from the member portal. Questions about a gift or refund can be sent to the church through the Contact page.</p>
      <h2>Live streaming</h2>
      <p>Broadcasts may be recorded and published in the Sermon Library. Third-party platforms such as YouTube or Facebook have their own terms.</p>
      <h2>Limitation</h2>
      <p>The website is provided as-is. The church is not liable for interruptions, errors or third-party services outside its control, to the extent permitted by law.</p>
      <h2>Changes</h2>
      <p>These terms may be updated. Continued use of the site means you accept the latest version.</p>
    </LegalPage>
  );
}
