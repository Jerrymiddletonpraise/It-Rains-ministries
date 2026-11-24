"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/** Refreshes the page when a broadcast starts, pauses or ends, so viewers never need to reload. */
export function LiveRefresher({ streamId }: { streamId: string | null }) {
  const router = useRouter();
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    const supabase = createClient();
    const ch = supabase.channel("streams-status")
      .on("postgres_changes", { event: "*", schema: "public", table: "streams" }, (p: { new: { id?: string; status?: string }; old: { status?: string } }) => {
        if (!streamId || p.new?.id === streamId || p.new?.status === "live") router.refresh();
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [router, streamId]);
  return null;
}
