import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { useSeo } from "@/lib/seo";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Form";
import { Notice } from "@/components/ui/Misc";
import { AuthShell } from "./AuthShell";

export default function ForgotPassword() {
  useSeo("Reset Password");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!supabase) return;
    const email = String(new FormData(e.currentTarget).get("email"));
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
    if (error) setErr(error.message); else setSent(true);
  }
  return (
    <AuthShell title="Forgot password" intro="We will email you a secure link to choose a new password." footer={<Link to="/login" className="text-gold hover:underline">Back to sign in</Link>}>
      {sent ? <Notice tone="success">If an account exists for that email, a reset link is on its way.</Notice> : (
        <form onSubmit={submit} className="space-y-5">
          <Field label="Email" htmlFor="f-email"><Input id="f-email" name="email" type="email" required autoComplete="email" disabled={!isSupabaseConfigured} /></Field>
          {err && <Notice tone="error">{err}</Notice>}
          <Button type="submit" className="w-full" disabled={!isSupabaseConfigured}>Send reset link</Button>
        </form>
      )}
    </AuthShell>
  );
}
