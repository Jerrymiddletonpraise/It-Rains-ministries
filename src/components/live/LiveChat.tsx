"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Send, EyeOff, Ban, HandHeart, MessageCircle, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Msg = { id: string; user_id: string | null; display_name: string; body: string; kind: string; hidden: boolean; created_at: string };
type Tab = "chat" | "prayer" | "greeting";

export function LiveChat({ streamId, signedIn, isModerator, chatEnabled }: { streamId: string; signedIn: boolean; isModerator: boolean; chatEnabled: boolean }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [tab, setTab] = useState<Tab>("chat");
  const [text, setText] = useState("");
  const [guestName, setGuestName] = useState("");
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [sending, setSending] = useState(false);
  const list = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    const supabase = createClient();
    supabase.from("chat_messages").select("*").eq("stream_id", streamId).order("created_at", { ascending: false }).limit(100)
      .then(({ data }: { data: Msg[] | null }) => setMessages((data ?? []).reverse()));
    const ch = supabase.channel(`chat:${streamId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `stream_id=eq.${streamId}` },
        (p: { new: Msg }) => setMessages((m) => (m.some((x) => x.id === p.new.id) ? m : [...m.slice(-199), p.new])))
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "chat_messages", filter: `stream_id=eq.${streamId}` },
        (p: { new: Msg }) => setMessages((m) => m.map((x) => (x.id === p.new.id ? p.new : x))))
      .on("broadcast", { event: "moderate" }, ({ payload }: { payload: { id?: string; userId?: string } }) =>
        setMessages((m) => m.filter((x) => (payload.id ? x.id !== payload.id : x.user_id !== payload.userId) || isModerator)))
      .subscribe();
    channelRef.current = ch;
    return () => { supabase.removeChannel(ch); };
  }, [streamId, isModerator]);

  useEffect(() => { list.current?.scrollTo({ top: list.current.scrollHeight, behavior: "smooth" }); }, [messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true); setNotice(null);
    const kind = tab === "greeting" ? "greeting" : tab;
    const res = await fetch("/api/live/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ streamId, body: text, kind, guestName: guestName || undefined }) });
    const data = await res.json().catch(() => ({}));
    setSending(false);
    if (!res.ok) return setNotice({ ok: false, text: data.error ?? "Message not sent." });
    setText("");
    if (data.private) setNotice({ ok: true, text: "Your prayer request was sent privately to the prayer team. We are praying with you." });
  }

  async function moderate(action: "hide" | "unhide" | "ban", m: Msg) {
    const res = await fetch("/api/live/moderate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, messageId: m.id, userId: m.user_id }) });
    if (!res.ok) return;
    if (action !== "unhide") channelRef.current?.send({ type: "broadcast", event: "moderate", payload: action === "ban" ? { userId: m.user_id } : { id: m.id } });
    setMessages((list) => list.map((x) => (action === "ban" ? x.user_id === m.user_id : x.id === m.id) ? { ...x, hidden: action !== "unhide" } : x));
  }

  const visible = messages.filter((m) => isModerator || !m.hidden);
  const tabs: [Tab, string, typeof MessageCircle][] = [["chat", "Live chat", MessageCircle], ["prayer", "Prayer", HandHeart], ["greeting", "Greetings & testimony", Sparkles]];
  const needsLogin = tab !== "prayer" && !signedIn;

  return (
    <div className="flex h-[32rem] flex-col overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-navy-900/5 lg:h-full lg:min-h-[36rem]">
      <div className="flex border-b border-navy-900/10">
        {tabs.map(([k, label, Icon]) => (
          <button key={k} onClick={() => setTab(k)} className={cn("flex flex-1 items-center justify-center gap-1.5 px-2 py-3 text-xs font-semibold sm:text-sm", tab === k ? "border-b-2 border-royal-700 text-royal-800" : "text-navy-800/60")}>
            <Icon className="h-4 w-4" />{label}
          </button>
        ))}
      </div>
      <div ref={list} className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
        {tab === "prayer" ? (
          <div className="rounded-xl bg-royal-100 p-4 text-sm text-royal-900">Send a prayer request during the service. It goes privately to our prayer team and is not shown in the chat.</div>
        ) : visible.length === 0 ? (
          <p className="pt-10 text-center text-sm text-navy-800/50">{chatEnabled ? "Be the first to say hello 👋" : "Chat is turned off for this broadcast."}</p>
        ) : visible.map((m) => (
          <div key={m.id} className={cn("group text-sm", m.hidden && "opacity-40")}>
            <span className={cn("font-semibold", m.kind === "moderator" ? "text-gold-600" : "text-royal-700")}>{m.display_name}{m.kind === "moderator" && " ✦"}</span>
            {m.kind === "greeting" && <span className="ml-1 rounded bg-gold-200 px-1.5 text-[10px] font-bold uppercase">Greeting</span>}
            {m.kind === "testimony" && <span className="ml-1 rounded bg-royal-100 px-1.5 text-[10px] font-bold uppercase">Testimony</span>}
            <p className="break-words text-navy-900">{m.body}</p>
            {isModerator && m.kind !== "moderator" && (
              <span className="hidden gap-2 text-xs group-hover:flex">
                <button onClick={() => moderate(m.hidden ? "unhide" : "hide", m)} className="flex items-center gap-1 text-navy-800/60 hover:text-red-600"><EyeOff className="h-3 w-3" />{m.hidden ? "Unhide" : "Hide"}</button>
                {m.user_id && <button onClick={() => moderate("ban", m)} className="flex items-center gap-1 text-navy-800/60 hover:text-red-600"><Ban className="h-3 w-3" />Block user</button>}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="border-t border-navy-900/10 p-3">
        {notice && <p className={cn("mb-2 text-xs", notice.ok ? "text-emerald-700" : "text-red-600")}>{notice.text}</p>}
        {needsLogin ? (
          <p className="py-2 text-center text-sm"><Link href="/login?next=/watch" className="font-semibold text-royal-700">Sign in</Link> or <Link href="/register" className="font-semibold text-royal-700">create a free account</Link> to join the chat.</p>
        ) : !chatEnabled && tab !== "prayer" ? null : (
          <form onSubmit={send} className="space-y-2">
            {tab === "prayer" && !signedIn && <input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Your name" maxLength={60} className="w-full rounded-lg border border-navy-900/10 px-3 py-2 text-sm" />}
            <div className="flex gap-2">
              <input value={text} onChange={(e) => setText(e.target.value)} maxLength={500} placeholder={tab === "prayer" ? "Your prayer request…" : tab === "greeting" ? "Send a greeting or share a testimony…" : "Say something…"}
                aria-label="Message" className="min-w-0 flex-1 rounded-full border border-navy-900/10 px-4 py-2.5 text-sm focus:border-royal-500 focus:outline-none" />
              <button disabled={sending || !text.trim()} aria-label="Send" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-500 text-navy-950 disabled:opacity-50"><Send className="h-4 w-4" /></button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
