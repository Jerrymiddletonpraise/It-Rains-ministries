import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { LayoutDashboard, UserRound, Gift, Calendar, HandHeart, Users, LogOut, Shield } from "lucide-react";

const TABS = [
  ["/account", "Overview", LayoutDashboard], ["/account/profile", "Profile", UserRound], ["/account/giving", "Giving history", Gift],
  ["/account/events", "My events", Calendar], ["/account/prayers", "Prayer requests", HandHeart], ["/account/groups", "Groups", Users],
] as const;

export const dynamic = "force-dynamic";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const { user, roles } = await requireUser();
  return (
    <div className="min-h-screen bg-ivory pt-20">
      <div className="bg-heaven px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold-400">Member portal</p>
          <h1 className="mt-2 font-serif text-4xl font-bold text-white">Welcome, {(user.user_metadata?.full_name as string)?.split(" ")[0] || "beloved"}</h1>
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[240px_1fr]">
        <nav className="flex gap-2 overflow-x-auto lg:flex-col" aria-label="Account">
          {TABS.map(([href, label, Icon]) => (
            <Link key={href} href={href} className="flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-navy-800 hover:bg-white"><Icon className="h-4 w-4 text-royal-700" />{label}</Link>
          ))}
          {roles.length > 0 && <Link href="/admin" className="flex shrink-0 items-center gap-3 rounded-xl bg-navy-900 px-4 py-3 text-sm font-semibold text-gold-400"><Shield className="h-4 w-4" />Admin dashboard</Link>}
          <form action="/auth/signout" method="post"><button className="flex w-full shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-700 hover:bg-white"><LogOut className="h-4 w-4" />Sign out</button></form>
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
