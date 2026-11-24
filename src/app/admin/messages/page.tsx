import { requireArea } from "@/lib/auth";
import { setMessageStatus } from "@/app/actions/admin";
import { AdminHeader, Badge } from "@/components/admin/ui";
import { Empty } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

export default async function MessagesAdmin() {
  const { supabase } = await requireArea("messages");
  const { data } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(200);
  return (
    <>
      <AdminHeader title="Messages & greetings" intro="Contact form messages and greetings sent to the ministry." />
      {data?.length ? <div className="space-y-4">{data.map((m) => (
        <div key={m.id} className={`rounded-2xl bg-white p-5 shadow-sm ${m.status === "new" ? "ring-2 ring-gold-400" : ""}`}>
          <div className="flex flex-wrap items-center gap-2 text-sm"><strong>{m.name}</strong><a href={`mailto:${m.email}`} className="text-royal-700">{m.email}</a>{m.phone && <span>{m.phone}</span>}<Badge tone={m.kind === "greeting" ? "purple" : "gray"}>{m.kind}</Badge><Badge tone={m.status === "new" ? "gold" : "gray"}>{m.status}</Badge><span className="text-navy-800/50">{formatDateTime(m.created_at)}</span></div>
          {m.subject && <p className="mt-2 font-semibold">{m.subject}</p>}
          <p className="mt-1 whitespace-pre-line">{m.message}</p>
          <div className="mt-3 flex gap-2">
            <a href={`mailto:${m.email}?subject=${encodeURIComponent("Re: " + (m.subject ?? "Your message to IT RAINS MINISTRIES"))}`} className="rounded-full bg-royal-700 px-4 py-2 text-sm font-semibold text-white">Reply by email</a>
            {["read", "replied"].filter((s) => s !== m.status).map((s) => <form key={s} action={setMessageStatus}><input type="hidden" name="id" value={m.id} /><input type="hidden" name="status" value={s} /><button className="rounded-full px-4 py-2 text-sm ring-1 ring-navy-900/10">Mark {s}</button></form>)}
          </div>
        </div>
      ))}</div> : <Empty title="No messages yet" />}
    </>
  );
}
