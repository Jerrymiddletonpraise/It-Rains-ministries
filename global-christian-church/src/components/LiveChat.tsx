import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { MessagesSquare, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Form";

interface Msg { id: string; display_name: string; body: string; created_at: string; }

/** Real-time chat beside the live player. Anyone can read; signed-in members can post. */
export function LiveChat({ broadcastId }: { broadcastId: string }) {
  const { user, profile } = useAuth();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!supabase) return;
    const sb = supabase;
    const load = () => sb.from("live_chat_messages").select("id,display_name,body,created_at").eq("broadcast_id", broadcastId).eq("status", "visible")
      .order("created_at", { ascending: false }).limit(80).then(({ data }) => setMsgs(((data ?? []) as Msg[]).reverse()));
    void load();
    const ch = sb.channel(`chat-${broadcastId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "live_chat_messages", filter: `broadcast_id=eq.${broadcastId}` },
        (p) => { const m = p.new as Msg & { status: string }; if (m.status === "visible") setMsgs((x) => (x.some((y) => y.id === m.id) ? x : [...x.slice(-79), m])); })
      .subscribe();
    const poll = setInterval(load, 20_000); // picks up messages a moderator has hidden
    return () => { clearInterval(poll); void sb.removeChannel(ch); };
  }, [broadcastId]);

  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight }); }, [msgs]);

  async function send(e: FormEvent) {
    e.preventDefault(); if (!supabase || !user || !text.trim()) return;
    const display_name = (profile?.full_name || user.email?.split("@")[0] || "Member").slice(0, 60);
    const { data, error } = await supabase.from("live_chat_messages").insert({ broadcast_id: broadcastId, display_name, body: text.trim().slice(0, 500) }).select("id,display_name,body,created_at").single();
    if (error) { setErr("Your message could not be sent. Chat may be closed for this broadcast."); return; }
    setErr(null); setText(""); setMsgs((x) => (x.some((y) => y.id === data.id) ? x : [...x, data as Msg]));
  }

  return (
    <div className="card-luxe flex min-h-[320px] flex-1 flex-col p-6 lg:hover:translate-y-0">
      <p className="eyebrow mb-3 flex items-center gap-2"><MessagesSquare className="h-3.5 w-3.5" aria-hidden />Live chat</p>
      <ul ref={listRef} aria-live="polite" className="max-h-80 flex-1 space-y-2 overflow-y-auto pr-1 text-sm">
        {msgs.map((m) => <li key={m.id}><span className="font-semibold text-gold-light">{m.display_name}</span> <span className="text-ivory-muted">{m.body}</span></li>)}
        {!msgs.length && <li className="text-ivory-muted">Say hello and share where you are watching from.</li>}
      </ul>
      {user ? (
        <form onSubmit={send} className="mt-4 flex gap-2">
          <label htmlFor="chat-input" className="sr-only">Chat message</label>
          <Input id="chat-input" value={text} maxLength={500} onChange={(e) => setText(e.target.value)} placeholder="Type a message" className="h-10 py-2" />
          <Button type="submit" size="sm" className="h-10" aria-label="Send"><Send className="h-4 w-4" /></Button>
        </form>
      ) : <p className="mt-4 text-xs text-ivory-muted"><Link to="/login" className="text-gold underline">Sign in</Link> or <Link to="/register" className="text-gold underline">create a free account</Link> to chat. Watching never needs an account.</p>}
      {err && <p className="mt-2 text-xs text-red-300">{err}</p>}
    </div>
  );
}
