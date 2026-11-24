import Link from "next/link";
import { notFound } from "next/navigation";
import { ENTITIES } from "@/lib/admin-entities";
import { requireArea } from "@/lib/auth";
import { saveEntity, deleteEntity } from "@/app/actions/admin";
import { EntityForm } from "@/components/admin/EntityForm";
import { AdminHeader } from "@/components/admin/ui";
import { ConfirmButton } from "@/components/admin/ConfirmButton";

export default async function EntityEdit({ params }: { params: Promise<{ entity: string; id: string }> }) {
  const { entity, id } = await params;
  const def = ENTITIES[entity];
  if (!def) notFound();
  const { supabase } = await requireArea(def.area);
  const isNew = id === "new";
  let row: Record<string, unknown> | null = null;
  if (!isNew) {
    const { data } = await supabase.from(def.table).select("*").eq("id", id).maybeSingle();
    if (!data) notFound();
    row = data;
  }
  const action = saveEntity.bind(null, entity, isNew ? null : id);
  return (
    <>
      <Link href={`/admin/${entity}`} className="text-sm font-semibold text-royal-700">← {def.label}</Link>
      <AdminHeader title={isNew ? `New ${def.singular}` : String(row?.title ?? row?.name ?? def.singular)}
        action={!isNew && (
          <form action={deleteEntity}><input type="hidden" name="entity" value={entity} /><input type="hidden" name="id" value={id} />
            <ConfirmButton message={`Delete this ${def.singular}? This cannot be undone.`}>Delete</ConfirmButton></form>
        )} />
      <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8"><EntityForm def={def} row={row} action={action} /></div>
    </>
  );
}
