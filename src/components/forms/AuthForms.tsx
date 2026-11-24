"use client";
import Link from "next/link";
import { signIn, signUp, requestReset, updatePassword } from "@/app/actions/auth";
import { ActionForm } from "./ActionForm";
import { Checkbox, Field } from "@/components/ui";

export function LoginForm({ next }: { next?: string }) {
  return (
    <ActionForm action={signIn} submitLabel="Sign in" resetOnSuccess={false}>
      <input type="hidden" name="next" value={next ?? "/account"} />
      <Field label="Email" name="email" type="email" required autoComplete="email" />
      <Field label="Password" name="password" type="password" required autoComplete="current-password" />
      <p className="text-right text-sm"><Link href="/forgot-password" className="text-royal-700 hover:underline">Forgot password?</Link></p>
    </ActionForm>
  );
}

export function RegisterForm() {
  return (
    <ActionForm action={signUp} submitLabel="Create my account">
      <Field label="Full name" name="full_name" required autoComplete="name" />
      <Field label="Email" name="email" type="email" required autoComplete="email" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Password" name="password" type="password" required minLength={8} autoComplete="new-password" />
        <Field label="Confirm password" name="confirm" type="password" required minLength={8} autoComplete="new-password" />
      </div>
      <Checkbox name="newsletter" defaultChecked label="Send me ministry announcements and newsletters" />
      <Checkbox name="agree" required label={<>I agree to the <Link href="/terms" className="underline">Terms</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link></>} />
    </ActionForm>
  );
}

export function ForgotForm() {
  return (
    <ActionForm action={requestReset} submitLabel="Send reset link">
      <Field label="Email" name="email" type="email" required autoComplete="email" />
    </ActionForm>
  );
}

export function ResetForm() {
  return (
    <ActionForm action={updatePassword} submitLabel="Update password" protect={false}>
      <Field label="New password" name="password" type="password" required minLength={8} autoComplete="new-password" />
      <Field label="Confirm new password" name="confirm" type="password" required minLength={8} autoComplete="new-password" />
    </ActionForm>
  );
}
