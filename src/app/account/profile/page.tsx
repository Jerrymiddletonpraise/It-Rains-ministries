import { requireUser } from "@/lib/auth";
import { Card } from "@/components/ui";
import { ProfileForm } from "@/components/forms/ProfileForm";
import { ResetForm } from "@/components/forms/AuthForms";

export default async function Profile() {
  const { user, supabase } = await requireUser();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return (
    <div className="space-y-6">
      <Card className="p-6 md:p-8"><h2 className="mb-6 font-serif text-2xl font-bold">My profile</h2><ProfileForm profile={profile ?? {}} email={user.email ?? ""} /></Card>
      <Card className="p-6 md:p-8"><h2 className="mb-6 font-serif text-2xl font-bold">Change password</h2><ResetForm /></Card>
    </div>
  );
}
