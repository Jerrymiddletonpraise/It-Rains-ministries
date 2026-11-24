import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus, ExternalLink } from "lucide-react";
import { ENTITIES } from "@/lib/admin-entities";
import { requireArea } from "@/lib/auth";
import { AdminHeader, Badge, tableCls, tdCls, thCls } from "@/components/admin/ui";
import { Notice, Empty } from "@/components/ui";
import { formatDate, formatDateTime, MEDIA_CATEGORIES } from "@/lib/utils";

export default async function EntityList({ params, searchParams }: { params: Promise<{ entity: string }>; searchParams: Promise<{ saved?: string; deleted?: string; q?: string }> }) {
  const [{ entity }, sp] = await Promise.all([params, searchParams]);
  const def = ENTITIES[entity];
  if (!def) notFound();
  const { supabase } = await requireArea(def.area);
  let q = supabase.from(def.table).select("*").order(def.order.column, { ascending: def.order.ascending }).limit(300);
  if (sp.q) q = q.ilike(def.columns[0].name, `%${sp.q.replace(/[%,]/g, "")}%`);
  const { data: rows } = await q;
  return (
    <>
      <AdminHeader title={def.label} action={<Link href={`/admin/${entity}/new`} className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-bold text-navy-950"><Plus className="h-4 w-4" />New {def.singular}</Link>} />
      {sp.saved && <div className="mb-4"><Notice kind="success">Saved successfully.</Notice></div>}
      {sp.deleted && <div className="mb-4"><Notice kind="success">Deleted.</Notice></div>}
      <form className="mb-4"><input name="q" defaultValue={sp.q} placeholder={`Search ${def.label.toLowerCase()}…`} className="w-full max-w-sm rounded-full border border-navy-900/10 bg-white px-4 py-2 text-sm" /></form>
      {rows?.length ? (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className={tableCls}>
            <thead><tr>{def.columns.map((c) => <th key={c.name} className={thCls}>{c.label}</th>)}<th className={thCls} /></tr></thead>
            <tbody>{rows.map((r) => (
              <tr key={r.id} className="hover:bg-ivory">
                {def.columns.map((c, i) => {
                  const v = r[c.name];
                  const shown = c.type === "bool" ? (v ? <Badge tone="green">Yes</Badge> : <Badge>No</Badge>) : c.type === "datetime" ? (v ? formatDateTime(v) : "") : c.type === "date" ? (v ? formatDate(v) : "") : c.type === "select" ? (MEDIA_CATEGORIES[v] ?? v) : String(v ?? "");
                  return <td key={c.name} className={tdCls}>{i === 0 ? <Link href={`/admin/${entity}/${r.id}`} className="font-semibold text-royal-800 hover:underline">{shown}</Link> : shown}</td>;
                })}
                <td className={`${tdCls} whitespace-nowrap text-right`}>
                  {entity === "events" && <Link href={`/admin/events/${r.id}/registrations`} className="mr-3 text-sm font-semibold text-royal-700">Registrations</Link>}
                  {def.publicPath && <a href={def.publicPath(r)} target="_blank" className="inline-flex text-navy-800/50 hover:text-royal-700" aria-label="View on site"><ExternalLink className="h-4 w-4" /></a>}
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      ) : <Empty title={`No ${def.label.toLowerCase()} yet`}><Link href={`/admin/${entity}/new`} className="font-semibold text-royal-700">Create the first one</Link></Empty>}
    </>
  );
}
