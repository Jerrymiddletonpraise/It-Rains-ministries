"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/** Real-time viewer count using Supabase Realtime Presence (every open player counts once). */
export function useViewerCount(streamId: string | null, track = true) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!streamId || !process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    const supabase = createClient();
    const key = crypto.randomUUID();
    const channel = supabase.channel(`presence:stream:${streamId}`, { config: { presence: { key } } });
    channel
      .on("presence", { event: "sync" }, () => setCount(Object.keys(channel.presenceState()).length))
      .subscribe(async (status: string) => {
        if (status === "SUBSCRIBED" && track) await channel.track({ at: Date.now() });
      });
    return () => { supabase.removeChannel(channel); };
  }, [streamId, track]);
  return count;
}
