import { Link, NavLink, Outlet } from "react-router-dom";
import { BarChart3, Bell, BookOpen, CalendarDays, ClipboardList, Film, Inbox, Gauge, HandCoins, HandHeart, HeartHandshake, KeyRound, LayoutTemplate, Plug, Radio, Settings, ShieldCheck, UserPlus, Users } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { SECTION_ACCESS, hasAnyRole } from "@/auth/roles";
import { useSeo } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { Logo, LogoMark } from "@/components/layout/Logo";
import { ButtonLink } from "@/components/ui/Button";

export const SECTIONS = [
  { id: "overview", label: "Overview", Icon: Gauge, path: "" },
  { id: "inbox", label: "Inbox", Icon: Inbox, path: "inbox" },
  { id: "content", label: "Website content", Icon: LayoutTemplate, path: "content", phase: 6 },
  { id: "members", label: "Members", Icon: Users, path: "members", phase: 6 },
  { id: "visitors", label: "Visitors", Icon: UserPlus, path: "visitors", phase: 6 },
  { id: "ministries", label: "Ministries", Icon: HeartHandshake, path: "ministries", phase: 9 },
  { id: "events", label: "Events", Icon: CalendarDays, path: "events" },
  { id: "sermons", label: "Sermons", Icon: BookOpen, path: "sermons" },
  { id: "media", label: "Media", Icon: Film, path: "media", phase: 11 },
  { id: "streaming", label: "Live streaming", Icon: Radio, path: "streaming" },
  { id: "giving", label: "Giving", Icon: HandCoins, path: "giving", phase: 8 },
  { id: "prayer", label: "Prayer requests", Icon: HandHeart, path: "prayer" },
  { id: "volunteers", label: "Volunteers", Icon: ClipboardList, path: "volunteers", phase: 9 },
  { id: "notifications", label: "Notifications", Icon: Bell, path: "notifications", phase: 12 },
  { id: "reports", label: "Reports", Icon: BarChart3, path: "reports", phase: 13 },
  { id: "integrations", label: "Integrations", Icon: Plug, path: "integrations", phase: 7 },
  { id: "settings", label: "Website settings", Icon: Settings, path: "settings" },
  { id: "roles", label: "Roles and access", Icon: KeyRound, path: "roles" },
  { id: "audit", label: "Audit log", Icon: ShieldCheck, path: "audit" },
] as const;

export default function ControlCenter() {
  useSeo("GCC Control Center");
  const { roles } = useAuth();
  const visible = SECTIONS.filter((s) => hasAnyRole(roles, SECTION_ACCESS[s.id]));
  return (
    <div className="min-h-screen bg-ink-soft pt-20">
      <header className="fixed inset-x-0 top-0 z-40 flex h-20 items-center justify-between border-b border-line bg-ink/90 px-4 backdrop-blur-xl sm:px-8">
        <Link to="/" aria-label="Back to website"><Logo compact /></Link>
        <div className="flex gap-2"><ButtonLink to="/" variant="ghost" size="sm">View website</ButtonLink><ButtonLink to="/portal" variant="outline" size="sm">My portal</ButtonLink></div>
      </header>
      <div className="flex">
        <aside className="sticky top-20 hidden h-[calc(100vh-5rem)] w-64 shrink-0 overflow-y-auto border-r border-line bg-ink p-4 lg:block">
          <div className="mb-6 flex items-center gap-3 px-2"><LogoMark className="h-8 w-8" /><p className="font-display text-lg tracking-[0.16em]">CONTROL <span className="text-gold">CENTER</span></p></div>
          <nav aria-label="Control Center"><ul className="space-y-1">{visible.map((s) => (
            <li key={s.id}><NavLink end to={`/control-center/${s.path}`} className={({ isActive }) => cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition", isActive ? "bg-gold/10 text-gold-light" : "text-ivory-muted hover:bg-white/5 hover:text-ivory")}>
              <s.Icon className="h-4 w-4" aria-hidden />{s.label}{"phase" in s && <span className="ml-auto text-[0.6rem] text-ivory-muted/60">P{s.phase}</span>}
            </NavLink></li>
          ))}</ul></nav>
        </aside>
        <div className="min-w-0 flex-1">
          <nav aria-label="Control Center sections" className="flex gap-2 overflow-x-auto border-b border-line px-4 py-3 lg:hidden">
            {visible.map((s) => <NavLink end key={s.id} to={`/control-center/${s.path}`} className={({ isActive }) => cn("shrink-0 rounded-full border px-3 py-1.5 text-xs", isActive ? "border-gold text-gold" : "border-line text-ivory-muted")}>{s.label}</NavLink>)}
          </nav>
          <div className="p-4 sm:p-8"><Outlet /></div>
        </div>
      </div>
    </div>
  );
}
