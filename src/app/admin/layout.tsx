import { requireUser } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { LogoMark } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin", robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, roles } = await requireUser("/admin");
  if (!roles.length) {
    return (
      <div className="bg-heaven flex min-h-screen items-center justify-center p-4">
        <div className="max-w-md rounded-3xl bg-white p-10 text-center">
          <LogoMark className="mx-auto h-14 w-14" />
          <h1 className="mt-4 font-serif text-3xl font-bold">Staff access only</h1>
          <p className="mt-2 text-navy-800/70">Your account ({user.email}) doesn&apos;t have an admin role. Ask a Super Admin to grant you access.</p>
          <ButtonLink href="/account" variant="purple" className="mt-6">Go to my account</ButtonLink>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[#f4f2fa] lg:grid lg:grid-cols-[260px_1fr]">
      <AdminNav roles={roles} email={user.email ?? ""} />
      <div className="min-w-0 p-4 sm:p-6 lg:p-10">{children}</div>
    </div>
  );
}
