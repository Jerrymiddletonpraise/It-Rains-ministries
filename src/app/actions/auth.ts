"use server";
import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { enabled, env } from "@/lib/env";
import { guardForm } from "@/lib/security";
import type { ActionState } from "@/components/forms/ActionForm";

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const safeNext = (n: string) => (n.startsWith("/") && !n.startsWith("//") ? n : "/account");

export async function signIn(_: ActionState, f: FormData): Promise<ActionState> {
  if (!enabled.supabase) return { ok: false, message: "Member login isn't connected yet." };
  const blocked = await guardForm(f, "login", 10, 600);
  if (blocked) return { ok: false, message: blocked };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: str(f, "email"), password: String(f.get("password") ?? "") });
  if (error) return { ok: false, message: error.message === "Email not confirmed" ? "Please confirm your email first. Check your inbox." : "Incorrect email or password." };
  redirect(safeNext(str(f, "next")));
}

export async function signUp(_: ActionState, f: FormData): Promise<ActionState> {
  if (!enabled.supabase) return { ok: false, message: "Member registration isn't connected yet." };
  const blocked = await guardForm(f, "signup", 5, 3600);
  if (blocked) return { ok: false, message: blocked };
  const parsed = z.object({
    full_name: z.string().min(2, "Please enter your full name.").max(120),
    email: z.string().email("Please enter a valid email."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirm: z.string(),
  }).refine((d) => d.password === d.confirm, { message: "Passwords do not match." })
    .safeParse({ full_name: str(f, "full_name"), email: str(f, "email"), password: String(f.get("password") ?? ""), confirm: String(f.get("confirm") ?? "") });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  if (f.get("agree") !== "on") return { ok: false, message: "Please accept the terms and privacy policy." };
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email, password: parsed.data.password,
    options: {
      emailRedirectTo: `${env.siteUrl}/auth/callback?next=/account`,
      data: { full_name: parsed.data.full_name, newsletter_opt_in: f.get("newsletter") === "on" },
    },
  });
  if (error) return { ok: false, message: error.message };
  if (data.session) redirect("/account?welcome=1");
  return { ok: true, message: "Welcome to the family! Please check your email and click the link to confirm your account." };
}

export async function requestReset(_: ActionState, f: FormData): Promise<ActionState> {
  if (!enabled.supabase) return { ok: false, message: "Member login isn't connected yet." };
  const blocked = await guardForm(f, "reset", 4, 3600);
  if (blocked) return { ok: false, message: blocked };
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(str(f, "email"), { redirectTo: `${env.siteUrl}/auth/callback?next=/reset-password` });
  return { ok: true, message: "If an account exists for that email, a reset link is on its way." };
}

export async function updatePassword(_: ActionState, f: FormData): Promise<ActionState> {
  const password = String(f.get("password") ?? "");
  if (password.length < 8) return { ok: false, message: "Password must be at least 8 characters." };
  if (password !== String(f.get("confirm") ?? "")) return { ok: false, message: "Passwords do not match." };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "Your password has been updated." };
}
