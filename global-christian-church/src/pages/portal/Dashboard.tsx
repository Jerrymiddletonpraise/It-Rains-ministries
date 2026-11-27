import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Bell, BookmarkCheck, CalendarCheck, HandHeart, HeartHandshake, LayoutDashboard, LogOut, Receipt, UserRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/AuthProvider";
import { ROLE_LABELS, STAFF_ROLES, hasAnyRole } from "@/auth/roles";
import { useSeo } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Form";
import { AwaitingBadge, Notice } from "@/components/ui/Misc";

interface MyPrayer { id: string; request: string; status: string; visibility: string; created_at: string; }
interface MyReg { id: string; status: string; events: { title: string; starts_at: string } | null; }

export default function Dashboard() {
  useSeo("Member Portal");
  const { user, profile, roles, refresh, signOut } = useAuth();
  const [saved, setSaved] = useState<"idle" | "ok" | "err">("idle");
  const [prayers, setPrayers] = useState<MyPrayer[]>([]);
  const [regs, setRegs] = useState<MyReg[]>([]);

  useEffect(() => {
    if (!supabase || !user) return;
    supabase.from("prayer_requests").select("id,request,status,visibility,created_at").eq("requester_id", user.id).order("created_at", { ascending: false }).limit(5).then(({ data }) => setPrayers((data ?? []) as MyPrayer[]));
    supabase.from("event_registrations").select("id,status,events(title,starts_at)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5).then(({ data }) => setRegs((data ?? []) as unknown as MyReg[]));
  }, [user]);

  async function saveProfile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!supabase || !user) return;
    const fd = new FormData(e.currentTarget);
    const v = (k: string) => (String(fd.get(k) ?? "").trim() || null);
    const { error } = await supabase.from("profiles").update({ full_name: v("full_name"), phone: v("phone"), city: v("city"), country: v("country") }).eq("id", user.id);
    setSaved(error ? "err" : "ok"); if (!error) await refresh();
  }

  const later = [
    { Icon: BookmarkCheck, title: "Saved sermons" }, { Icon: Receipt, title: "Giving history and receipts" },
    { Icon: Bell, title: "Notifications" }, { Icon: HeartHandshake, title: "Volunteer opportunities" },
  ];

  return (
    <div className="container pb-24 pt-32">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div><p className="eyebrow">Member portal</p><h1 className="mt-3 text-5xl">Welcome{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}</h1>
          <div className="mt-4 flex flex-wrap gap-2">{roles.map((r) => <span key={r} className="rounded-full border border-gold/40 px-3 py-1 text-xs text-gold-light">{ROLE_LABELS[r]}</span>)}</div></div>
        <div className="flex gap-3">
          {hasAnyRole(roles, STAFF_ROLES) && <ButtonLink to="/control-center" variant="outline"><LayoutDashboard className="h-4 w-4" aria-hidden />Control Center</ButtonLink>}
          <Button variant="ghost" onClick={signOut}><LogOut className="h-4 w-4" aria-hidden />Sign out</Button>
        </div>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        <section className="card-luxe p-6 lg:col-span-1 lg:hover:translate-y-0" aria-labelledby="profile-h">
          <h2 id="profile-h" className="flex items-center gap-2 text-2xl"><UserRound className="h-5 w-5 text-gold" aria-hidden />My profile</h2>
          <p className="mt-1 text-xs text-ivory-muted">{user?.email}</p>
          <form onSubmit={saveProfile} className="mt-6 space-y-4">
            <Field label="Full name" htmlFor="p-name"><Input id="p-name" name="full_name" defaultValue={profile?.full_name ?? ""} /></Field>
            <Field label="Phone" htmlFor="p-phone"><Input id="p-phone" name="phone" type="tel" defaultValue={profile?.phone ?? ""} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="City" htmlFor="p-city"><Input id="p-city" name="city" defaultValue={profile?.city ?? ""} /></Field>
              <Field label="Country" htmlFor="p-country"><Input id="p-country" name="country" defaultValue={profile?.country ?? ""} /></Field>
            </div>
            <Button type="submit" size="sm">Save profile</Button>
            {saved === "ok" && <Notice tone="success">Profile saved.</Notice>}
            {saved === "err" && <Notice tone="error">Could not save your profile.</Notice>}
          </form>
        </section>

        <section className="card-luxe p-6 lg:hover:translate-y-0" aria-labelledby="prayer-h">
          <h2 id="prayer-h" className="flex items-center gap-2 text-2xl"><HandHeart className="h-5 w-5 text-gold" aria-hidden />My prayer requests</h2>
          <ul className="mt-4 space-y-3">{prayers.length ? prayers.map((p) => (
            <li key={p.id} className="rounded-xl border border-line p-4"><p className="line-clamp-2 text-sm">{p.request}</p><p className="mt-2 text-xs text-ivory-muted">{formatDate(p.created_at)} · {p.visibility} · <span className="text-gold-light">{p.status.replace("_", " ")}</span></p></li>
          )) : <li className="text-sm text-ivory-muted">You have not submitted any prayer requests yet.</li>}</ul>
          <ButtonLink to="/prayer" size="sm" variant="outline" className="mt-4">New request</ButtonLink>
        </section>

        <section className="card-luxe p-6 lg:hover:translate-y-0" aria-labelledby="events-h">
          <h2 id="events-h" className="flex items-center gap-2 text-2xl"><CalendarCheck className="h-5 w-5 text-gold" aria-hidden />My event registrations</h2>
          <ul className="mt-4 space-y-3">{regs.length ? regs.map((r) => (
            <li key={r.id} className="rounded-xl border border-line p-4"><p className="text-sm font-semibold">{r.events?.title}</p><p className="mt-1 text-xs text-ivory-muted">{r.events && formatDate(r.events.starts_at)} · {r.status}</p></li>
          )) : <li className="text-sm text-ivory-muted">No event registrations yet.</li>}</ul>
          <ButtonLink to="/events" size="sm" variant="outline" className="mt-4">Browse events</ButtonLink>
        </section>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {later.map(({ Icon, title }) => (
          <div key={title} className="rounded-2xl border border-dashed border-line p-6"><Icon className="h-5 w-5 text-gold" aria-hidden /><p className="mt-3 font-semibold">{title}</p><AwaitingBadge className="mt-3" label="Arrives in the member portal phase" /></div>
        ))}
      </div>
      <p className="mt-8 text-sm text-ivory-muted">Want to make it official? <Link to="/membership" className="text-gold hover:underline">Apply for membership</Link>.</p>
    </div>
  );
}
