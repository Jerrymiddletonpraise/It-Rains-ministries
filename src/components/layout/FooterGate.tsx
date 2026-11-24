"use client";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
export function FooterGate({ children }: { children: ReactNode }) {
  return usePathname().startsWith("/admin") ? null : <>{children}</>;
}
