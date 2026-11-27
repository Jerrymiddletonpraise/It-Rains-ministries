import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ChevronDown, Menu, Radio, UserRound, X } from "lucide-react";
import { navGroups } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/Button";
import { useAuth } from "@/auth/AuthProvider";
import { Logo } from "./Logo";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const { pathname } = useLocation();
  const { user } = useAuth();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => { const f = () => setScrolled(window.scrollY > 24); f(); window.addEventListener("scroll", f, { passive: true }); return () => window.removeEventListener("scroll", f); }, []);
  useEffect(() => { setOpen(null); setMobile(false); }, [pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(null); setMobile(false); } };
    const onClick = (e: MouseEvent) => { if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(null); };
    window.addEventListener("keydown", onKey); document.addEventListener("mousedown", onClick);
    return () => { window.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onClick); };
  }, []);
  useEffect(() => { document.body.style.overflow = mobile ? "hidden" : ""; }, [mobile]);

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 transition-all duration-500", scrolled || mobile ? "border-b border-line bg-ink/85 backdrop-blur-xl" : "bg-gradient-to-b from-ink/80 to-transparent")}>
      <div className="container flex h-20 items-center justify-between gap-6">
        <Link to="/" aria-label="Global Christian Church home"><Logo /></Link>

        <nav ref={navRef} aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {navGroups.map((g) => (
            <div key={g.label} className="relative">
              <button
                type="button" aria-expanded={open === g.label} aria-haspopup="true"
                onClick={() => setOpen(open === g.label ? null : g.label)}
                onMouseEnter={() => setOpen(g.label)}
                className={cn("flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-ivory-muted transition hover:text-ivory", open === g.label && "text-ivory")}
              >
                {g.label}<ChevronDown className={cn("h-3.5 w-3.5 transition", open === g.label && "rotate-180")} aria-hidden />
              </button>
              {open === g.label && (
                <div onMouseLeave={() => setOpen(null)} className="absolute left-1/2 top-full w-72 -translate-x-1/2 pt-3">
                  <ul className="glass animate-fade-up rounded-2xl p-2 shadow-luxe [animation-duration:.35s]">
                    {g.items.map((i) => (
                      <li key={i.to}>
                        <NavLink to={i.to} className={({ isActive }) => cn("block rounded-xl px-4 py-3 transition hover:bg-white/5", isActive && "bg-gold/10")}>
                          <span className="block text-sm font-semibold text-ivory">{i.label}</span>
                          {i.description && <span className="block text-xs text-ivory-muted">{i.description}</span>}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ButtonLink to="/watch" variant="outline" size="sm" className="hidden sm:inline-flex"><Radio className="h-3.5 w-3.5" aria-hidden />Watch Live</ButtonLink>
          <ButtonLink to="/give" size="sm" className="hidden sm:inline-flex">Give</ButtonLink>
          <Link to={user ? "/portal" : "/login"} aria-label={user ? "Member portal" : "Sign in"} className="hidden h-9 w-9 items-center justify-center rounded-full border border-line text-ivory-muted transition hover:border-gold hover:text-gold lg:flex">
            <UserRound className="h-4 w-4" aria-hidden />
          </Link>
          <button type="button" className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-ivory lg:hidden" aria-label={mobile ? "Close menu" : "Open menu"} aria-expanded={mobile} aria-controls="mobile-nav" onClick={() => setMobile(!mobile)}>
            {mobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobile && (
        <nav id="mobile-nav" aria-label="Mobile" className="h-[calc(100dvh-5rem)] overflow-y-auto border-t border-line bg-ink px-4 pb-12 pt-6 lg:hidden">
          <div className="mb-8 grid grid-cols-2 gap-3">
            <ButtonLink to="/watch" variant="outline"><Radio className="h-4 w-4" aria-hidden />Watch Live</ButtonLink>
            <ButtonLink to="/give">Give Online</ButtonLink>
          </div>
          {navGroups.map((g) => (
            <div key={g.label} className="mb-8">
              <p className="eyebrow mb-3">{g.label}</p>
              <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                {g.items.map((i) => (
                  <li key={i.to}><NavLink to={i.to} className={({ isActive }) => cn("block rounded-lg px-3 py-3 font-display text-2xl text-ivory", isActive && "text-gold")}>{i.label}</NavLink></li>
                ))}
              </ul>
            </div>
          ))}
          <ButtonLink to={user ? "/portal" : "/login"} variant="ivory" className="w-full">{user ? "Member Portal" : "Member Sign In"}</ButtonLink>
        </nav>
      )}
    </header>
  );
}
