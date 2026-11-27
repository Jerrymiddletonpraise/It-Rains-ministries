import { useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/AuthProvider";
import { useSeo } from "@/lib/seo";
import { Button } from "@/components/ui/Button";
import { Checkbox, Field, Input } from "@/components/ui/Form";
import { Notice } from "@/components/ui/Misc";
import { AuthShell } from "./AuthShell";

export default function Register() {
  useSeo("Create Account");
  const { user } = useAuth();
  const [err, setErr] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/portal" replace />;

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!supabase) return;
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password"));
    if (password.length < 8) { setErr("Please use at least 8 characters for your password."); return; }
    if (password !== fd.get("confirm")) { setErr("The passwords do not match."); return; }
    setBusy(true); setErr(null);
    const { data, error } = await supabase.auth.signUp({
      email: String(fd.get("email")), password,
      options: { emailRedirectTo: `${window.location.origin}/portal`, data: { full_name: String(fd.get("name")), marketing_consent: fd.get("updates") === "on" } },
    });
    setBusy(false);
    if (error) setErr(error.message); else if (!data.session) setSent(true);
  }
  if (sent) return <AuthShell title="Check your email"><Notice tone="success">We sent a confirmation link to your email address. Open it to activate your account.</Notice></AuthShell>;
  return (
    <AuthShell title="Join the family" intro="Create your Global Christian Church member account." footer={<>Already have an account? <Link to="/login" className="text-gold hover:underline">Sign in</Link></>}>
      <form onSubmit={submit} className="space-y-5">
        <Field label="Full name" htmlFor="r-name"><Input id="r-name" name="name" required autoComplete="name" disabled={!isSupabaseConfigured} /></Field>
        <Field label="Email" htmlFor="r-email"><Input id="r-email" name="email" type="email" required autoComplete="email" disabled={!isSupabaseConfigured} /></Field>
        <Field label="Password" htmlFor="r-pw" hint="At least 8 characters."><Input id="r-pw" name="password" type="password" required minLength={8} autoComplete="new-password" disabled={!isSupabaseConfigured} /></Field>
        <Field label="Confirm password" htmlFor="r-pw2"><Input id="r-pw2" name="confirm" type="password" required autoComplete="new-password" disabled={!isSupabaseConfigured} /></Field>
        <Checkbox id="r-terms" name="terms" required label={<>I agree to the <Link to="/terms" className="text-gold underline">Terms</Link> and <Link to="/privacy" className="text-gold underline">Privacy Policy</Link>.</>} />
        <Checkbox id="r-updates" name="updates" label="Send me church news and event updates (optional)." />
        {err && <Notice tone="error">{err}</Notice>}
        <Button type="submit" className="w-full" disabled={busy || !isSupabaseConfigured}>{busy ? "Creating account…" : "Create account"}</Button>
      </form>
    </AuthShell>
  );
}
