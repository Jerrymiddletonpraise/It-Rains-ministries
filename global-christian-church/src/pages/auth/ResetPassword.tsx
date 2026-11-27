import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/AuthProvider";
import { useSeo } from "@/lib/seo";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Form";
import { Notice } from "@/components/ui/Misc";
import { AuthShell } from "./AuthShell";

/** Reached from the email link. Supabase signs the user in with a recovery session first. */
export default function ResetPassword() {
  useSeo("Choose a New Password");
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [err, setErr] = useState<string | null>(null);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!supabase) return;
    const fd = new FormData(e.currentTarget); const pw = String(fd.get("password"));
    if (pw.length < 8) return setErr("Please use at least 8 characters.");
    if (pw !== fd.get("confirm")) return setErr("The passwords do not match.");
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) setErr(error.message); else nav("/portal", { replace: true });
  }
  return (
    <AuthShell title="Choose a new password">
      {!loading && !user ? <Notice tone="warn">This reset link has expired or was already used. Request a new one from the sign-in page.</Notice> : (
        <form onSubmit={submit} className="space-y-5">
          <Field label="New password" htmlFor="n-pw"><Input id="n-pw" name="password" type="password" required minLength={8} autoComplete="new-password" /></Field>
          <Field label="Confirm password" htmlFor="n-pw2"><Input id="n-pw2" name="confirm" type="password" required autoComplete="new-password" /></Field>
          {err && <Notice tone="error">{err}</Notice>}
          <Button type="submit" className="w-full">Update password</Button>
        </form>
      )}
    </AuthShell>
  );
}
