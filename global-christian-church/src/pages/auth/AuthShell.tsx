import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { LogoMark } from "@/components/layout/Logo";
import { Notice } from "@/components/ui/Misc";
import { isSupabaseConfigured } from "@/integrations/supabase/client";

export function AuthShell({ title, intro, children, footer }: { title: string; intro?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="grain relative flex min-h-screen items-center justify-center px-4 pb-16 pt-32">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,hsl(var(--gold)/0.2),transparent_60%)]" />
      <div className="w-full max-w-md">
        <div className="mb-8 text-center"><Link to="/" className="inline-block"><LogoMark className="mx-auto h-14 w-14" /></Link><h1 className="mt-6 text-4xl">{title}</h1>{intro && <p className="mt-3 text-sm text-ivory-muted">{intro}</p>}</div>
        <div className="glass rounded-2xl p-6 shadow-luxe sm:p-8">
          {!isSupabaseConfigured && <Notice tone="warn" title="Awaiting configuration" className="mb-6">Member accounts open once the church’s Supabase project is connected. Sign-in is not available yet.</Notice>}
          {children}
        </div>
        {footer && <div className="mt-6 text-center text-sm text-ivory-muted">{footer}</div>}
      </div>
    </div>
  );
}
