import { useState } from "react";
import { CreditCard, Lock, Repeat, ShieldCheck } from "lucide-react";
import { useSeo } from "@/lib/seo";
import { useCollection } from "@/lib/data";
import { demoCampaigns } from "@/lib/demo";
import type { GivingCampaign } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PageHero } from "@/components/ui/PageHero";
import { AwaitingBadge, DemoBadge, Notice, Section, SectionHeading } from "@/components/ui/Misc";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Form";

export const GIVING_CATEGORIES = [
  { id: "tithe", label: "Tithes" }, { id: "offering", label: "General offerings" }, { id: "missions", label: "Missions" },
  { id: "building_fund", label: "Building fund" }, { id: "benevolence", label: "Benevolence" }, { id: "special_projects", label: "Special projects" },
];
const AMOUNTS = [25, 50, 100, 250, 500];

export default function Give() {
  useSeo("Online Giving", "Give tithes and offerings to Global Christian Church securely online.");
  const campaigns = useCollection<GivingCampaign>("giving_campaigns", demoCampaigns, { eq: { is_active: true }, order: "created_at" });
  const [cat, setCat] = useState("tithe");
  const [freq, setFreq] = useState<"once" | "monthly">("once");
  const [amount, setAmount] = useState<number | "">(50);

  return (
    <>
      <PageHero eyebrow="Generosity" title="Online Giving" intro="Partner with Global Christian Church as we reach the world with the gospel." />
      <Section>
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="card-luxe p-6 sm:p-10 lg:col-span-3 lg:hover:translate-y-0">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-3"><h2 className="text-3xl">Make a gift</h2><AwaitingBadge label="Payments awaiting configuration" /></div>
            <fieldset className="mb-8">
              <legend className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-ivory-muted">Giving category</legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {GIVING_CATEGORIES.map((c) => <button type="button" key={c.id} aria-pressed={cat === c.id} onClick={() => setCat(c.id)} className={cn("rounded-xl border px-3 py-3 text-sm transition", cat === c.id ? "border-gold bg-gold/10 text-gold-light" : "border-line text-ivory-muted hover:border-gold/50")}>{c.label}</button>)}
              </div>
            </fieldset>
            <fieldset className="mb-8">
              <legend className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-ivory-muted">Frequency</legend>
              <div className="grid grid-cols-2 gap-2">
                {([["once", "One-time", CreditCard], ["monthly", "Monthly recurring", Repeat]] as const).map(([v, l, Icon]) => (
                  <button type="button" key={v} aria-pressed={freq === v} onClick={() => setFreq(v)} className={cn("flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm", freq === v ? "border-gold bg-gold/10 text-gold-light" : "border-line text-ivory-muted")}><Icon className="h-4 w-4" aria-hidden />{l}</button>
                ))}
              </div>
            </fieldset>
            <fieldset className="mb-8">
              <legend className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-ivory-muted">Amount (USD)</legend>
              <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-5">{AMOUNTS.map((a) => <button type="button" key={a} aria-pressed={amount === a} onClick={() => setAmount(a)} className={cn("rounded-xl border py-3 font-display text-2xl", amount === a ? "border-gold bg-gold/10 text-gold-light" : "border-line text-ivory")}>${a}</button>)}</div>
              <Field label="Other amount" htmlFor="g-amt"><Input id="g-amt" type="number" min={1} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")} /></Field>
            </fieldset>
            <Button size="lg" className="w-full" disabled aria-describedby="give-status"><Lock className="h-4 w-4" aria-hidden />Continue to secure payment</Button>
            <Notice tone="warn" className="mt-4" title="Online giving is not active yet"><span id="give-status">Stripe and PayPal checkout will open in sandbox (test) mode first. Live payments only start after the church administrator provides credentials and approves activation. No payment can be taken today.</span></Notice>
          </div>
          <aside className="space-y-6 lg:col-span-2">
            <div className="card-luxe p-8 lg:hover:translate-y-0">
              <ShieldCheck className="h-8 w-8 text-gold" aria-hidden />
              <h2 className="mt-4 text-3xl">Secure by design</h2>
              <ul className="mt-4 space-y-3 text-sm text-ivory-muted">
                <li>Card and bank details are entered on Stripe or PayPal and never reach this website.</li>
                <li>Payment secrets stay on the server in Supabase Edge Functions.</li>
                <li>Members receive receipts and can see their giving history in the member portal.</li>
              </ul>
            </div>
          </aside>
        </div>
      </Section>
      <Section tone="charcoal">
        <SectionHeading eyebrow="Campaigns" title="Giving campaigns" />
        {campaigns.isDemo && <div className="mb-6 text-center"><DemoBadge /></div>}
        <div className="grid gap-6 md:grid-cols-2">{campaigns.data.map((c) => <article key={c.id} className="card-luxe p-8"><p className="eyebrow text-[0.6rem]">{GIVING_CATEGORIES.find((g) => g.id === c.category)?.label ?? c.category}</p><h3 className="mt-2 text-3xl">{c.title}</h3>{c.description && <p className="mt-3 text-ivory-muted">{c.description}</p>}</article>)}</div>
      </Section>
    </>
  );
}
