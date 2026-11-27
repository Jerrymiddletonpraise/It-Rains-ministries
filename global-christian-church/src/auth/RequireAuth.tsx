import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { hasAnyRole, type AppRole } from "./roles";
import { Spinner } from "@/components/ui/Misc";
import { ButtonLink } from "@/components/ui/Button";

/**
 * Client-side route guard for a better experience. It is not the security boundary:
 * every table is protected by Row Level Security in the database.
 */
export function RequireAuth({ children, roles }: { children: ReactNode; roles?: AppRole[] }) {
  const { loading, user, roles: mine, configured } = useAuth();
  const location = useLocation();
  if (!configured) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (loading) return <div className="pt-32"><Spinner /></div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (roles && !hasAnyRole(mine, roles)) {
    return (
      <div className="container flex min-h-[70vh] flex-col items-center justify-center pt-24 text-center">
        <ShieldAlert className="h-10 w-10 text-gold" aria-hidden />
        <h1 className="mt-6 text-4xl">Access restricted</h1>
        <p className="mt-4 max-w-md text-ivory-muted">Your account does not have a role that can open this area. A church administrator can grant access if you need it.</p>
        <ButtonLink to="/portal" variant="outline" className="mt-8">Back to my portal</ButtonLink>
      </div>
    );
  }
  return <>{children}</>;
}
