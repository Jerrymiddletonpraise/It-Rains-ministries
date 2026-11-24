import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** Signed, expiring download link. Visibility is checked with the visitor's own session (RLS), so members-only files stay protected. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await createClient();
  const { data: m } = await s.from("media_items").select("file_path,slug").eq("id", id).maybeSingle();
  if (!m?.file_path) return NextResponse.redirect(new URL("/login?next=/sermons", req.url));
  const { data } = await createAdminClient().storage.from("media").createSignedUrl(m.file_path, 600, { download: true });
  if (!data) return new NextResponse("File unavailable", { status: 404 });
  return NextResponse.redirect(data.signedUrl);
}
