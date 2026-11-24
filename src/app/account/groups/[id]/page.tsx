import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { Card, Empty } from "@/components/ui";
import { GroupPostForm } from "@/components/forms/GroupPostForm";
import { formatDateTime } from "@/lib/utils";

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, supabase } = await requireUser();
  const { data: g } = await supabase.from("groups").select("*").eq("id", id).maybeSingle();
  if (!g) notFound();
  const [{ data: member }, { data: posts }, { count }] = await Promise.all([
    supabase.from("group_members").select("user_id").eq("group_id", id).eq("user_id", user.id).maybeSingle(),
    supabase.from("group_posts").select("*").eq("group_id", id).order("created_at", { ascending: false }).limit(100),
    supabase.from("group_members").select("user_id", { count: "exact", head: true }).eq("group_id", id),
  ]);
  return (
    <div className="space-y-5">
      <Link href="/account/groups" className="text-sm font-semibold text-royal-700">← All groups</Link>
      <Card><h2 className="font-serif text-3xl font-bold">{g.name}</h2><p className="mt-1 text-navy-800/80">{g.description}</p><p className="mt-2 text-xs text-navy-800/60">{count ?? 0} members{g.meeting_info ? ` · ${g.meeting_info}` : ""}</p></Card>
      {member ? <Card><GroupPostForm groupId={id} /></Card> : <Card>Join this group to read and post.</Card>}
      {posts?.length ? posts.map((p) => (
        <Card key={p.id}><p className="text-sm font-semibold text-royal-700">{p.author_name} <span className="font-normal text-navy-800/50">· {formatDateTime(p.created_at)}</span></p><p className="mt-1 whitespace-pre-line">{p.body}</p></Card>
      )) : member && <Empty title="No posts yet. Start the conversation!" />}
    </div>
  );
}
