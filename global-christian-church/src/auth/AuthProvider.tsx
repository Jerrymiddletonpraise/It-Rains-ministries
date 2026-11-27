import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import type { AppRole } from "./roles";

export interface Profile { id: string; full_name: string | null; phone: string | null; avatar_url: string | null; city: string | null; country: string | null; }

interface AuthState {
  configured: boolean; loading: boolean; session: Session | null; user: User | null;
  profile: Profile | null; roles: AppRole[]; refresh: () => Promise<void>; signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  const loadUserData = useCallback(async (uid: string | undefined) => {
    if (!supabase || !uid) { setProfile(null); setRoles([]); return; }
    const [p, r] = await Promise.all([
      supabase.from("profiles").select("id,full_name,phone,avatar_url,city,country").eq("id", uid).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid),
    ]);
    if (p.error) console.error("[gcc] profile:", p.error.message);
    if (r.error) console.error("[gcc] roles:", r.error.message);
    setProfile((p.data as Profile | null) ?? null);
    setRoles(((r.data ?? []) as { role: AppRole }[]).map((x) => x.role));
  }, []);

  useEffect(() => {
    if (!supabase) return;
    // Subscribe first, then read the stored session, so no auth event is missed.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      // Defer Supabase calls out of the auth callback to avoid deadlocks.
      setTimeout(() => { void loadUserData(s?.user?.id); }, 0);
    });
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      await loadUserData(data.session?.user?.id);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, [loadUserData]);

  const value: AuthState = {
    configured: isSupabaseConfigured, loading, session, user: session?.user ?? null, profile, roles,
    refresh: () => loadUserData(session?.user?.id),
    signOut: async () => { await supabase?.auth.signOut(); setProfile(null); setRoles([]); },
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
