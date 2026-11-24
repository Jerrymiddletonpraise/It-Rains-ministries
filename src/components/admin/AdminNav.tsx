"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Radio, Film, Calendar, Megaphone, Church, HandHeart, Quote, Inbox, Gift, Send, FileText, Users, UsersRound, BarChart3, Menu, X, ExternalLink, LogOut,
} from "lucide-react";
import { can, ROLE_LABELS, type Area, type Role } from "@/lib/roles";
import { LogoMark, Wordmark } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

const ITEMS: [string, string, Area, typeof Radio][] = [
  ["/admin", "Overview", "overview", LayoutDashboard], ["/admin/live", "Live broadcasts", "live", Radio], ["/admin/media", "Sermons & media", "media", Film],
  ["/admin/events", "Events", "events", Calendar], ["/admin/announcements", "Announcements", "announcements", Megaphone], ["/admin/prayer", "Prayer requests", "prayer", HandHeart],
  ["/admin/testimonies", "Testimonies", "testimonies", Quote], ["/admin/messages", "Messages", "messages", Inbox], ["/admin/giving", "Giving", "giving", Gift],
  ["/admin/newsletter", "Newsletter", "newsletter", Send], ["/admin/content", "Website content", "content", FileText], ["/admin/departments", "Departments", "departments", Church],
  ["/admin/groups", "Online groups", "groups", UsersRound], ["/admin/members", "Members & roles", "members", Users], ["/admin/analytics", "Analytics", "analytics", BarChart3],
];

export function AdminNav({ roles, email }: { roles: Role[]; email: string }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const items = ITEMS.filter(([, , area]) => can(roles, area) || (area === "members" && roles.includes("super_admin")));
  return (
    <aside className="bg-navy-950 text-white lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
      <div className="flex items-center justify-between p-5">
        <Link href="/admin" className="flex items-center gap-3"><LogoMark className="h-12 w-12" /><Wordmark sub="ADMIN" /></Link>
        <button className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X /> : <Menu />}</button>
      </div>
      <nav className={cn("space-y-1 px-3 pb-6", !open && "hidden lg:block")}>
        {items.map(([href, label, , Icon]) => {
          const active = href === "/admin" ? path === "/admin" : path.startsWith(href);
          return <Link key={href} href={href} onClick={() => setOpen(false)} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm", active ? "bg-royal-700 text-white" : "text-white/70 hover:bg-white/5")}><Icon className="h-4 w-4" />{label}</Link>;
        })}
        <div className="mt-6 border-t border-white/10 px-3 pt-4 text-xs text-white/50">
          <p className="truncate">{email}</p>
          <p className="mt-1 text-gold-500">{roles.map((r) => ROLE_LABELS[r]).join(", ")}</p>
          <Link href="/" className="mt-3 flex items-center gap-2 text-white/70 hover:text-white"><ExternalLink className="h-3.5 w-3.5" />View website</Link>
          <form action="/auth/signout" method="post"><button className="mt-2 flex items-center gap-2 text-white/70 hover:text-white"><LogOut className="h-3.5 w-3.5" />Sign out</button></form>
        </div>
      </nav>
    </aside>
  );
}
