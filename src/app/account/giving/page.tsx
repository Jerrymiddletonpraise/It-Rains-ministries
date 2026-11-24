import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { Card, Empty, Notice, ButtonLink } from "@/components/ui";
import { formatDate, formatMoney, FUNDS } from "@/lib/utils";

export default async function Giving({ searchParams }: { searchParams: Promise<{ portal?: string }> }) {
  const { user, supabase } = await requireUser();
  const sp = await searchParams;
  const [{ data: gifts }, { data: recurring }] = await Promise.all([
    supabase.from("donations").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(200),
    supabase.from("recurring_gifts").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
  ]);
  return (
    <div className="space-y-6">
      {sp.portal === "none" && <Notice kind="warn">We couldn&apos;t find a card-based monthly gift linked to your account.</Notice>}
      <Card>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div><h2 className="font-serif text-2xl font-bold">Monthly gifts</h2>
            {recurring?.length ? recurring.map((r) => <p key={r.id} className="text-sm text-navy-800/80">{formatMoney(r.amount_cents, r.currency)} / month · {FUNDS[r.fund]?.label} · <span className="capitalize">{r.status}</span></p>) : <p className="text-sm text-navy-800/70">You have no recurring gifts.</p>}
          </div>
          <div className="flex gap-2">
            {recurring?.some((r) => r.status === "active") && <form action="/api/give/portal" method="post"><button className="rounded-full bg-royal-700 px-5 py-2.5 text-sm font-semibold text-white">Manage / cancel</button></form>}
            <ButtonLink href="/give">Give now</ButtonLink>
          </div>
        </div>
      </Card>
      <Card className="overflow-x-auto p-0">
        <h2 className="p-6 pb-2 font-serif text-2xl font-bold">Giving history</h2>
        {gifts?.length ? (
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-navy-800/60"><tr>{["Date", "Fund", "Amount", "Method", "Status", "Receipt"].map((h) => <th key={h} className="px-6 py-3 font-medium">{h}</th>)}</tr></thead>
            <tbody>{gifts.map((g) => (
              <tr key={g.id} className="border-t border-navy-900/5">
                <td className="px-6 py-3">{formatDate(g.created_at)}</td><td className="px-6 py-3">{FUNDS[g.fund]?.label}</td>
                <td className="px-6 py-3 font-semibold">{formatMoney(g.amount_cents, g.currency)}</td><td className="px-6 py-3 capitalize">{g.provider}</td>
                <td className="px-6 py-3 capitalize">{g.status}</td><td className="px-6 py-3"><Link href={`/give/receipt/${g.id}`} className="font-semibold text-royal-700">{g.receipt_number}</Link></td>
              </tr>))}</tbody>
          </table>
        ) : <div className="p-6"><Empty title="No gifts yet">Gifts made while signed in, or with your account email, appear here.</Empty></div>}
      </Card>
    </div>
  );
}
