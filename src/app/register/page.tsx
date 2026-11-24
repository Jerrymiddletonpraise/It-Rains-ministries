import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/forms/AuthForms";
import { Notice } from "@/components/ui";
import { LogoMark } from "@/components/ui/Logo";

export const metadata: Metadata = { title: "Become a Member", robots: { index: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const sp = await searchParams;
  void sp;
  return (
    <div className="bg-heaven flex min-h-screen items-center justify-center px-4 pb-16 pt-28">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl md:p-10">
        <LogoMark className="mx-auto h-20 w-20" />
        <h1 className="mt-4 text-center font-serif text-3xl font-bold">Become a Member</h1>
        <p className="mb-6 mt-2 text-center text-sm text-navy-800/70">Create your free account to join the chat, track giving and access member resources.</p>
        {sp.error && <div className="mb-4"><Notice kind="error">That link is invalid or has expired. Please try again.</Notice></div>}
        <RegisterForm />
        <p className="mt-6 text-center text-sm">Already a member? <Link href="/login" className="font-semibold text-royal-700">Sign in</Link></p>
      </div>
    </div>
  );
}
