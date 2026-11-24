"use client";
export function PrintButton() {
  return <button onClick={() => window.print()} className="rounded-full border border-navy-900/15 px-4 py-2 text-sm font-semibold print:hidden">Print / Save PDF</button>;
}
