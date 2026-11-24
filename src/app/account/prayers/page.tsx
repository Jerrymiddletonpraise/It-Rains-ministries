import { requireUser } from "@/lib/auth";
import { Card, Empty, ButtonLink } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export default async function MyPrayers() {
  const { user, supabase } = await requireUser();
  const { data } = await supabase.from("prayer_requests").select("id,request,kind,status,response,responded_at,created_at").eq("user_id", user.id).order("created_at", { ascending: false });
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h2 className="font-serif text-2xl font-bold">My prayer requests</h2><ButtonLink href="/prayer" variant="purple">New request</ButtonLink></div>
      {data?.length ? data.map((r) => (
        <Card key={r.id}>
          <div className="flex justify-between text-xs text-navy-800/60"><span className="capitalize">{r.kind} · {formatDate(r.created_at)}</span><span className="rounded-full bg-royal-100 px-2 py-0.5 font-semibold capitalize text-royal-800">{r.status}</span></div>
          <p className="mt-2 whitespace-pre-line">{r.request}</p>
          {r.response && <div className="mt-3 rounded-xl bg-gold-200/40 p-4 text-sm"><p className="font-semibold text-royal-800">Response from the pastoral team</p><p className="mt-1 whitespace-pre-line">{r.response}</p></div>}
        </Card>
      )) : <Empty title="No prayer requests yet" />}
    </div>
  );
}
