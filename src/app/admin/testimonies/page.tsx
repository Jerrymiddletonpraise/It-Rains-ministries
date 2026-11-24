import { requireArea } from "@/lib/auth";
import { reviewTestimony, deleteTestimony } from "@/app/actions/admin";
import { AdminHeader, Badge } from "@/components/admin/ui";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Empty } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

export default async function TestimoniesAdmin({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { supabase } = await requireArea("testimonies");
  const { status = "pending" } = await searchParams;
  let q = supabase.from("testimonies").select("*").order("created_at", { ascending: false }).limit(200);
  if (status !== "all") q = q.eq("status", status);
  const { data } = await q;
  return (
    <>
      <AdminHeader title="Testimonies" intro="Only testimonies with the author's consent can be approved for publishing." />
      <div className="mb-6 flex gap-2">{["pending", "approved", "rejected", "all"].map((s) => <a key={s} href={`?status=${s}`} className={`rounded-full px-3 py-1.5 text-sm capitalize ${s === status ? "bg-royal-700 text-white" : "bg-white"}`}>{s}</a>)}</div>
      {data?.length ? <div className="space-y-4">{data.map((t) => (
        <div key={t.id} className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <strong>{t.name}</strong>{t.location && <span>· {t.location}</span>}
            <Badge tone={t.consent_to_publish ? "green" : "red"}>{t.consent_to_publish ? "Consent given" : "No consent: private"}</Badge>
            <Badge tone={t.status === "approved" ? "green" : t.status === "rejected" ? "red" : "gold"}>{t.status}</Badge>
            {t.is_answered_prayer && <Badge tone="purple">Answered prayer</Badge>}
            {!t.show_name && <Badge>Hide name</Badge>}
            <span className="text-navy-800/50">{formatDateTime(t.created_at)}</span>
          </div>
          <h3 className="mt-2 font-serif text-xl font-bold">{t.title}</h3>
          <p className="mt-1 whitespace-pre-line text-navy-800/85">{t.body}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {t.consent_to_publish && t.status !== "approved" && <form action={reviewTestimony}><input type="hidden" name="id" value={t.id} /><input type="hidden" name="status" value="approved" /><button className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">Approve & publish</button></form>}
            {t.status !== "rejected" && <form action={reviewTestimony}><input type="hidden" name="id" value={t.id} /><input type="hidden" name="status" value="rejected" /><button className="rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-navy-900/10">{t.status === "approved" ? "Unpublish" : "Don't publish"}</button></form>}
            <form action={deleteTestimony}><input type="hidden" name="id" value={t.id} /><ConfirmButton message="Delete permanently?">Delete</ConfirmButton></form>
          </div>
        </div>
      ))}</div> : <Empty title="Nothing to review" />}
    </>
  );
}
