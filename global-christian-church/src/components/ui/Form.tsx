import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const fieldBase = "w-full rounded-xl border border-line bg-ink-soft/80 px-4 py-3 text-sm text-ivory placeholder:text-ivory-muted/50 transition focus:border-gold/70 focus:outline-none focus:ring-2 focus:ring-gold/20";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...p }, ref) => <input ref={ref} className={cn(fieldBase, className)} {...p} />);
Input.displayName = "Input";
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...p }, ref) => <textarea ref={ref} className={cn(fieldBase, "min-h-[120px]", className)} {...p} />);
Textarea.displayName = "Textarea";
export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(({ className, ...p }, ref) => <select ref={ref} className={cn(fieldBase, "appearance-none", className)} {...p} />);
Select.displayName = "Select";

export function Field({ label, htmlFor, hint, required, children, className }: { label: string; htmlFor: string; hint?: string; required?: boolean; children: ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={htmlFor} className="block text-xs font-semibold uppercase tracking-[0.16em] text-ivory-muted">
        {label}{required && <span className="text-gold" aria-hidden> *</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-ivory-muted/70">{hint}</p>}
    </div>
  );
}

export function Checkbox({ id, label, ...p }: InputHTMLAttributes<HTMLInputElement> & { id: string; label: ReactNode }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm text-ivory-muted">
      <input id={id} type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-[hsl(var(--gold))]" {...p} />
      <span>{label}</span>
    </label>
  );
}
