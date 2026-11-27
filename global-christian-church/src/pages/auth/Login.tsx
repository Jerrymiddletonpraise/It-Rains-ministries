import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/AuthProvider";
import { useSeo } from "@/lib/seo";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Form";
import { Notice } from "@/components/ui/Misc";
import { AuthShell } from "./AuthShell";

export default function Login() {
  useSeo("Member Sign In");
  const { user } = useAuth();
  const nav = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? "/portal";
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to={from} replace />;

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!supabase) return;
    const fd = new FormData(e.currentTarget); setBusy(true); setErr(null);
    const { error } = await supabase.auth.signInWithPassword({ email: String(fd.get("email")), password: String(fd.get("password")) });
    setBusy(false);
    if (error) setErr(error.message === "Invalid login credentials" ? "That email and password do not match an account." : error.message);
    else nav(from, { replace: true });
  }
  return (
    <AuthShell title="Welcome back" intro="Sign in to your Global Christian Church account." footer={<>New here? <Link to="/register" className="text-gold hover:underline">Create an account</Link></>}>
      <form onSubmit={submit} className="space-y-5">
        <Field label="Email" htmlFor="l-email"><Input id="l-email" name="email" type="email" required autoComplete="email" disabled={!isSupabaseConfigured} /></Field>
        <Field label="Password" htmlFor="l-pw"><Input id="l-pw" name="password" type="password" required autoComplete="current-password" disabled={!isSupabaseConfigured} /></Field>
        <div className="text-right text-sm"><Link to="/forgot-password" className="text-gold hover:underline">Forgot password?</Link></div>
        {err && <Notice tone="error">{err}</Notice>}
        <Button type="submit" className="w-full" disabled={busy || !isSupabaseConfigured}>{busy ? "Signing in…" : "Sign in"}</Button>
      </form>
    </AuthShell>
  );
}
