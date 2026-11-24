import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getUpcomingEvents, getMedia } from "@/lib/data";
import { Card, Empty, Notice } from "@/components/ui";
import { EventCard, SermonCard } from "@/components/cards";
import { formatMoney } from "@/lib/utils";

export default async function AccountHome({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const { user, supabase } = await requireUser();
  const sp = await searchParams;
  const [{ data: announcements }, { data: gifts }, events, members] = await Promise.all([
    supabase.from("announcements").select("id,title,body,members_only,created_at").eq("published", true).order("created_at", { ascending: false }).limit(5),
    supabase.from("donations").select("amount_cents,currency,created_at").eq("user_id", user.id).eq("status", "succeeded").gte("created_at", `${new Date().getFullYear()}-01-01`),
    getUpcomingEvents(2),
    supabase.from("media_items").select("*").eq("published", true).eq("members_only", true).order("created_at", { ascending: false }).limit(3),
  ]);
  const byCur = (gifts ?? []).reduce<Record<string, number>>((a, g) => ({ ...a, [g.currency]: (a[g.currency] ?? 0) + g.amount_cents }), {});
  void getMedia;
  return (
    <div className="space-y-8">
      {sp.welcome && <Notice kind="success">Welcome to the IT RAINS MINISTRIES family! Your account is ready.</Notice>}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><p className="text-sm text-navy-800/60">Given in {new Date().getFullYear()}</p><p className="mt-1 font-serif text-3xl font-bold text-royal-800">{Object.keys(byCur).length ? Object.entries(byCur).map(([c, v]) => formatMoney(v, c)).join(" · ") : formatMoney(0)}</p><Link href="/account/giving" className="mt-2 inline-block text-sm font-semibold text-royal-700">View history →</Link></Card>
        <Card><p className="text-sm text-navy-800/60">Watch</p><p className="mt-1 font-serif text-2xl font-bold">Live services</p><Link href="/watch" className="mt-2 inline-block text-sm font-semibold text-royal-700">Go to Watch Live →</Link></Card>
        <Card><p className="text-sm text-navy-800/60">Need prayer?</p><p className="mt-1 font-serif text-2xl font-bold">We&apos;re here</p><Link href="/prayer" className="mt-2 inline-block text-sm font-semibold text-royal-700">Send a request →</Link></Card>
      </div>
      <section>
        <h2 className="mb-4 font-serif text-2xl font-bold">Announcements</h2>
        {announcements?.length ? <div className="space-y-3">{announcements.map((a) => (
          <Card key={a.id}><p className="font-semibold">{a.title}{a.members_only && <span className="ml-2 rounded-full bg-royal-100 px-2 py-0.5 text-xs text-royal-800">Members</span>}</p><p className="mt-1 whitespace-pre-line text-sm text-navy-800/80">{a.body}</p></Card>
        ))}</div> : <Empty title="No announcements right now" />}
      </section>
      <section>
        <h2 className="mb-4 font-serif text-2xl font-bold">Upcoming events</h2>
        {events.length ? <div className="grid gap-4 md:grid-cols-2">{events.map((e) => <EventCard key={e.id} e={e} />)}</div> : <Empty title="No upcoming events" />}
      </section>
      {(members.data?.length ?? 0) > 0 && (
        <section>
          <h2 className="mb-4 font-serif text-2xl font-bold">Members-only content</h2>
          <div className="grid gap-4 md:grid-cols-3">{members.data!.map((m) => <SermonCard key={m.id} m={m} />)}</div>
        </section>
      )}
    </div>
  );
}
