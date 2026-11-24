"use client";
import { useState, type ReactNode } from "react";

/** Two-step delete button (avoids browser confirm dialogs). */
export function ConfirmButton({ children, message }: { children: ReactNode; message: string }) {
  const [armed, setArmed] = useState(false);
  if (!armed) return <button type="button" onClick={() => setArmed(true)} className="rounded-full px-5 py-2.5 text-sm font-semibold text-red-700 ring-1 ring-red-200 hover:bg-red-50">{children}</button>;
  return (
    <span className="flex flex-wrap items-center gap-2 text-sm">
      <span className="text-red-700">{message}</span>
      <button type="submit" className="rounded-full bg-red-600 px-4 py-2 font-semibold text-white">Yes, delete</button>
      <button type="button" onClick={() => setArmed(false)} className="rounded-full px-4 py-2 ring-1 ring-navy-900/10">Cancel</button>
    </span>
  );
}
