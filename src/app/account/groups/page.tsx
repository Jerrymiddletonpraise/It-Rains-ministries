import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { joinGroup, leaveGroup } from "@/app/actions/member";
import { Card, Empty } from "@/components/ui";

export default async function Groups() {
  const { user, supabase } = await requireUser();
  const [{ data: groups }, { data: mine }] = await Promise.all([
    supabase.from("groups").select("*").order("name"),
    supabase.from("group_members").select("group_id").eq("user_id", user.id),
  ]);
  const joined = new Set((mine ?? []).map((m) => m.group_id));
  return (
    <div className="space-y-4">
      <h2 className="font-serif text-2xl font-bold">Online groups</h2>
      {groups?.length ? <div className="grid gap-4 md:grid-cols-2">{groups.map((g) => (
        <Card key={g.id} className="flex flex-col">
          <h3 className="font-serif text-xl font-bold">{g.name}</h3>
          <p className="mt-1 flex-1 text-sm text-navy-800/80">{g.description}</p>
          {g.meeting_info && <p className="mt-2 text-xs text-navy-800/60">{g.meeting_info}</p>}
          <div className="mt-4 flex gap-2">
            {joined.has(g.id) ? (
              <>
                <Link href={`/account/groups/${g.id}`} className="rounded-full bg-royal-700 px-4 py-2 text-sm font-semibold text-white">Open group</Link>
                <form action={leaveGroup}><input type="hidden" name="group_id" value={g.id} /><button className="rounded-full px-4 py-2 text-sm ring-1 ring-navy-900/10">Leave</button></form>
              </>
            ) : <form action={joinGroup}><input type="hidden" name="group_id" value={g.id} /><button className="rounded-full bg-gold-500 px-4 py-2 text-sm font-semibold text-navy-950">Join group</button></form>}
          </div>
        </Card>
      ))}</div> : <Empty title="No groups yet">Ministry leaders will open online groups soon.</Empty>}
    </div>
  );
}
