import { requireUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { can, ROLES, ROLE_LABELS, type Role } from "@/lib/roles";
import { setRoles, unbanUser } from "@/app/actions/admin";
import { AdminHeader, Badge, tableCls, tdCls, thCls } from "@/components/admin/ui";
import { formatDate } from "@/lib/utils";

export default async function Members({ searchParams }: { searchParams: Promise<{ q?: string; staff?: string }> }) {
  const { supabase, roles } = await requireUser("/admin");
  if (!can(roles, "members") && !roles.includes("super_admin")) redirect("/admin?denied=1");
  const sp = await searchParams;
  const isSuper = roles.includes("super_admin");
  let q = supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(300);
  if (sp.q) q = q.or(`full_name.ilike.%${sp.q.replace(/[%,()]/g, "")}%,email.ilike.%${sp.q.replace(/[%,()]/g, "")}%`);
  const [{ data: people }, { data: allRoles }, { data: bans }] = await Promise.all([q, supabase.from("user_roles").select("user_id,role"), supabase.from("chat_bans").select("user_id")]);
  const roleMap = new Map<string, Role[]>();
  allRoles?.forEach((r) => roleMap.set(r.user_id, [...(roleMap.get(r.user_id) ?? []), r.role as Role]));
  const banned = new Set(bans?.map((b) => b.user_id));
  const list = sp.staff ? (people ?? []).filter((p) => roleMap.has(p.id)) : people ?? [];
  return (
    <>
      <AdminHeader title="Members & roles" intro={isSuper ? "Grant staff access. Each role unlocks specific admin areas." : "Only a Super Admin can change roles."} />
      <form className="mb-4 flex flex-wrap gap-2">
        <input name="q" defaultValue={sp.q} placeholder="Search name or email…" className="w-full max-w-sm rounded-full border border-navy-900/10 bg-white px-4 py-2 text-sm" />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="staff" value="1" defaultChecked={Boolean(sp.staff)} />Staff only</label>
        <button className="rounded-full bg-royal-700 px-4 py-2 text-sm font-semibold text-white">Filter</button>
      </form>
      <details className="mb-6 rounded-2xl bg-white p-4 text-sm shadow-sm"><summary className="cursor-pointer font-semibold">What each role can do</summary>
        <ul className="mt-3 space-y-1 text-navy-800/80">
          <li><strong>Super Admin</strong>: everything, including roles.</li><li><strong>Pastor</strong>: live, media, events, announcements, departments, prayer, testimonies, messages, newsletter, website content, members.</li>
          <li><strong>Media Team</strong>: live broadcasts, sermons and media, chat moderation, analytics.</li><li><strong>Finance Team</strong>: giving records and exports, analytics.</li>
          <li><strong>Department Leader</strong>: events, announcements, departments, online groups.</li><li><strong>Moderator</strong>: live chat moderation, prayer requests, testimonies, messages.</li>
        </ul>
      </details>
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className={tableCls}>
          <thead><tr>{["Member", "Country", "Joined", isSuper ? "Roles" : "Roles"].map((h) => <th key={h} className={thCls}>{h}</th>)}</tr></thead>
          <tbody>{list.map((p) => {
            const r = roleMap.get(p.id) ?? [];
            return (
              <tr key={p.id}>
                <td className={tdCls}><p className="font-semibold">{p.full_name || "(no name)"}</p><p className="text-xs text-navy-800/60">{p.email}{p.phone ? ` · ${p.phone}` : ""}</p>
                  {banned.has(p.id) && <form action={unbanUser} className="mt-1"><input type="hidden" name="user_id" value={p.id} /><Badge tone="red">Chat blocked</Badge> <button className="text-xs text-royal-700">Unblock</button></form>}</td>
                <td className={tdCls}>{[p.city, p.country].filter(Boolean).join(", ")}</td>
                <td className={tdCls}>{formatDate(p.created_at)}</td>
                <td className={tdCls}>
                  {isSuper ? (
                    <form action={setRoles} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <input type="hidden" name="user_id" value={p.id} />
                      {ROLES.map((role) => <label key={role} className="flex items-center gap-1 text-xs"><input type="checkbox" name={`role_${role}`} defaultChecked={r.includes(role)} className="accent-royal-700" />{ROLE_LABELS[role]}</label>)}
                      <button className="rounded-full bg-navy-900 px-3 py-1 text-xs font-semibold text-white">Save</button>
                    </form>
                  ) : r.map((x) => <Badge key={x} tone="purple">{ROLE_LABELS[x]}</Badge>)}
                </td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>
    </>
  );
}
