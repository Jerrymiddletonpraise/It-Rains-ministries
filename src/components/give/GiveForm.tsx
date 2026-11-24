"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { CreditCard } from "lucide-react";
import { FUNDS, cn } from "@/lib/utils";
import { Field, Notice, TextArea, inputCls } from "@/components/ui";

const PRESETS = [10, 25, 50, 100, 250, 500];
const CURRENCIES = [["usd", "USD $"], ["eur", "EUR €"], ["gbp", "GBP £"], ["cad", "CAD $"], ["aud", "AUD $"]];

export function GiveForm({ stripe, paypal, paypalClientId, defaultFund, defaultEmail, defaultName }: {
  stripe: boolean; paypal: boolean; paypalClientId: string; defaultFund?: string; defaultEmail: string; defaultName: string;
}) {
  const router = useRouter();
  const [fund, setFund] = useState(defaultFund && defaultFund in FUNDS ? defaultFund : "offering");
  const [frequency, setFrequency] = useState<"one_time" | "monthly">("one_time");
  const [amount, setAmount] = useState("50");
  const [currency, setCurrency] = useState("usd");
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const payload = useMemo(() => ({ amount: Number(amount), currency, fund, frequency, name, email, note }), [amount, currency, fund, frequency, name, email, note]);
  const valid = Number(amount) >= 1 && /\S+@\S+\.\S+/.test(email);

  async function payWithCard() {
    setError(null);
    if (!valid) return setError("Please enter an amount of at least 1.00 and a valid email.");
    setBusy(true);
    try {
      const res = await fetch("/api/give/stripe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Could not start checkout");
      window.location.href = data.url;
    } catch (e) { setError((e as Error).message); setBusy(false); }
  }

  return (
    <div className="space-y-7">
      <div>
        <p className="mb-3 text-sm font-semibold text-navy-800">1. Choose where to give</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {Object.entries(FUNDS).map(([k, f]) => (
            <button key={k} type="button" onClick={() => setFund(k)} aria-pressed={fund === k}
              className={cn("rounded-xl border p-4 text-left transition", fund === k ? "border-royal-700 bg-royal-100 ring-2 ring-royal-700/20" : "border-navy-900/10 hover:border-royal-500")}>
              <span className="block font-semibold">{f.label}</span><span className="text-xs text-navy-800/60">{f.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold text-navy-800">2. Amount & frequency</p>
        <div className="mb-3 inline-flex rounded-full bg-navy-900/5 p-1">
          {(["one_time", "monthly"] as const).map((f) => (
            <button key={f} type="button" onClick={() => setFrequency(f)} aria-pressed={frequency === f}
              className={cn("rounded-full px-5 py-2 text-sm font-semibold", frequency === f ? "bg-white shadow" : "text-navy-800/60")}>
              {f === "one_time" ? "One-time" : "Monthly"}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {PRESETS.map((p) => (
            <button key={p} type="button" onClick={() => setAmount(String(p))}
              className={cn("rounded-xl border py-3 font-semibold", amount === String(p) ? "border-gold-500 bg-gold-200/50" : "border-navy-900/10")}>{p}</button>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
          <label className="sr-only" htmlFor="amt">Amount</label>
          <input id="amt" type="number" min={1} step="0.01" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputCls} />
          <label className="sr-only" htmlFor="cur">Currency</label>
          <select id="cur" value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputCls}>
            {CURRENCIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-sm font-semibold text-navy-800">3. Your details (for your receipt)</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" name="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          <Field label="Email" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </div>
        <TextArea label="Note or prayer (optional)" name="note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} />
      </div>

      {error && <Notice kind="error">{error}</Notice>}

      <div className="space-y-3">
        {stripe && (
          <button type="button" onClick={payWithCard} disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-royal-700 px-6 py-4 font-semibold text-white hover:bg-royal-800 disabled:opacity-60">
            <CreditCard className="h-5 w-5" />{busy ? "Opening secure checkout…" : `Give ${amount || 0} ${currency.toUpperCase()}${frequency === "monthly" ? " monthly" : ""} by card, Apple Pay or Google Pay`}
          </button>
        )}
        {paypal && frequency === "one_time" && (
          <PayPalScriptProvider options={{ clientId: paypalClientId, currency: currency.toUpperCase(), intent: "capture" }}>
            <PayPalButtons key={currency} style={{ layout: "vertical", shape: "pill", label: "donate" }} disabled={!valid}
              forceReRender={[payload]}
              createOrder={async () => {
                setError(null);
                const res = await fetch("/api/give/paypal/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
                const data = await res.json();
                if (!res.ok) { setError(data.error); throw new Error(data.error); }
                return data.id;
              }}
              onApprove={async (data) => {
                const res = await fetch("/api/give/paypal/capture", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: data.orderID, name, email, note }) });
                const out = await res.json();
                if (!res.ok) return setError(out.error ?? "Payment could not be completed.");
                router.push(`/give/thank-you?donation=${out.donationId}`);
              }}
              onError={() => setError("PayPal could not complete the payment. You have not been charged.")}
            />
          </PayPalScriptProvider>
        )}
        {paypal && frequency === "monthly" && <p className="text-center text-xs text-navy-800/60">Monthly gifts are processed by card. Switch to one-time to use PayPal.</p>}
      </div>
    </div>
  );
}
