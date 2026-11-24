"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, ChevronDown, UserRound } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

type Link_ = { href: string; label: string };
type NavItem = Link_ | { label: string; children: Link_[] };
const NAV: NavItem[] = [
  { label: "About", children: [
    { href: "/about", label: "About Us" }, { href: "/vision-mission", label: "Vision & Mission" },
    { href: "/pastor", label: "Meet Our Pastor" }, { href: "/faq", label: "FAQ" }] },
  { href: "/sermons", label: "Sermons" },
  { href: "/ministries", label: "Ministries" },
  { href: "/events", label: "Events" },
  { label: "Connect", children: [
    { href: "/prayer", label: "Prayer Request" }, { href: "/testimonies", label: "Testimonies" },
    { href: "/bible-study", label: "Bible Study" }, { href: "/contact", label: "Contact Us" }] },
];

export function NavBar({ live, signedIn, staff }: { live: boolean; signedIn: boolean; staff: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const path = usePathname();
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  if (path.startsWith("/admin")) return null;

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 transition-all", scrolled || open ? "bg-navy-950/95 shadow-lg backdrop-blur" : "bg-transparent")}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded focus:bg-white focus:px-3 focus:py-2">Skip to content</a>
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV.map((item) => "children" in item ? (
            <div key={item.label} className="group relative">
              <button className="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-white/85 hover:text-gold-400" aria-haspopup="true">
                {item.label}<ChevronDown className="h-4 w-4" />
              </button>
              <div className="invisible absolute left-0 top-full w-56 translate-y-2 rounded-2xl bg-white p-2 opacity-0 shadow-xl transition group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                {item.children.map((c) => (
                  <Link key={c.href} href={c.href} className="block rounded-xl px-4 py-2.5 text-sm text-navy-900 hover:bg-royal-100">{c.label}</Link>
                ))}
              </div>
            </div>
          ) : (
            <Link key={item.href} href={item.href} className={cn("rounded-full px-3 py-2 text-sm font-medium hover:text-gold-400", path.startsWith(item.href) ? "text-gold-400" : "text-white/85")}>{item.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/watch" className="hidden items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:border-gold-500 sm:flex">
            <span className={cn("h-2.5 w-2.5 rounded-full", live ? "animate-pulse-ring bg-red-500" : "bg-white/40")} />
            {live ? "LIVE NOW" : "Watch Live"}
          </Link>
          <Link href="/give" className="hidden rounded-full bg-gold-500 px-5 py-2 text-sm font-bold text-navy-950 hover:bg-gold-400 sm:block">Give</Link>
          <Link href={staff ? "/admin" : signedIn ? "/account" : "/login"} aria-label={signedIn ? "My account" : "Member login"} className="hidden h-10 w-10 items-center justify-center rounded-full text-white/85 hover:bg-white/10 lg:flex">
            <UserRound className="h-5 w-5" />
          </Link>
          <button className="rounded-full p-2 text-white lg:hidden" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Menu">
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="max-h-[calc(100vh-5rem)] overflow-y-auto border-t border-white/10 px-4 pb-8 lg:hidden" aria-label="Mobile">
          <div className="grid grid-cols-2 gap-3 py-4">
            <Link href="/watch" className="flex items-center justify-center gap-2 rounded-full border border-white/20 py-3 font-semibold text-white">
              <span className={cn("h-2.5 w-2.5 rounded-full", live ? "bg-red-500" : "bg-white/40")} />{live ? "LIVE NOW" : "Watch Live"}
            </Link>
            <Link href="/give" className="rounded-full bg-gold-500 py-3 text-center font-bold text-navy-950">Give</Link>
          </div>
          {NAV.flatMap((i): Link_[] => ("children" in i ? i.children : [i])).map((c) => (
            <Link key={c.href} href={c.href} className="block border-b border-white/5 py-3 text-white/90">{c.label}</Link>
          ))}
          <Link href={staff ? "/admin" : signedIn ? "/account" : "/login"} className="block py-3 font-semibold text-gold-400">
            {staff ? "Admin dashboard" : signedIn ? "My account" : "Member login / Register"}
          </Link>
        </nav>
      )}
    </header>
  );
}
