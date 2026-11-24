import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { cancelRegistration } from "@/app/actions/member";
import { Card, Empty, ButtonLink } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

export default async function MyEvents() {
  const { user, supabase } = await requireUser();
  const { data } = await supabase.from("event_registrations").select("id,status,guests,events(id,slug,title,starts_at,timezone,location,is_online)").eq("user_id", user.id).order("created_at", { ascending: false });
  type Row = { id: string; status: string; guests: number; events: { id: string; slug: string; title: string; starts_at: string; timezone: string; location: string | null; is_online: boolean } | null };
  const rows = (data ?? []) as unknown as Row[];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h2 className="font-serif text-2xl font-bold">My registrations</h2><ButtonLink href="/events" variant="purple">Browse events</ButtonLink></div>
      {rows.length ? rows.map((r) => r.events && (
        <Card key={r.id} className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <Link href={`/events/${r.events.slug}`} className="font-serif text-xl font-bold hover:text-royal-700">{r.events.title}</Link>
            <p className="text-sm text-navy-800/70">{formatDateTime(r.events.starts_at, r.events.timezone)} · {r.events.is_online ? "Online" : r.events.location}</p>
            <p className="text-sm capitalize">{r.status}{r.guests ? ` · +${r.guests} guests` : ""}</p>
          </div>
          <div className="flex gap-2">
            <a href={`/api/events/${r.events.id}/ics`} className="rounded-full bg-white px-4 py-2 text-sm font-semibold ring-1 ring-navy-900/10">Add to calendar</a>
            {r.status === "confirmed" && new Date(r.events.starts_at) > new Date() && (
              <form action={cancelRegistration}><input type="hidden" name="id" value={r.id} /><button className="rounded-full px-4 py-2 text-sm font-semibold text-red-700 ring-1 ring-red-200">Cancel</button></form>
            )}
          </div>
        </Card>
      )) : <Empty title="You haven't registered for any events yet" />}
    </div>
  );
}
