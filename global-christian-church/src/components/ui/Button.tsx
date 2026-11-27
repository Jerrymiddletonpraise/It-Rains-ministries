import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

type Variant = "gold" | "outline" | "ghost" | "ivory";
type Size = "sm" | "md" | "lg";

const base = "inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-wide transition duration-300 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap";
const variants: Record<Variant, string> = {
  gold: "bg-gradient-to-r from-gold-light via-gold to-gold-deep text-ink shadow-glow hover:brightness-110",
  outline: "border border-gold/60 text-gold-light hover:bg-gold/10 hover:border-gold",
  ghost: "text-ivory-muted hover:text-ivory hover:bg-white/5",
  ivory: "bg-ivory text-ink hover:bg-white",
};
const sizes: Record<Size, string> = { sm: "h-9 px-4 text-xs", md: "h-11 px-6 text-sm", lg: "h-14 px-8 text-sm uppercase tracking-[0.18em]" };

export const buttonClass = (variant: Variant = "gold", size: Size = "md", className?: string) => cn(base, variants[variant], sizes[size], className);

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }>(
  ({ variant, size, className, ...props }, ref) => <button ref={ref} className={buttonClass(variant, size, className)} {...props} />,
);
Button.displayName = "Button";

export function ButtonLink({ to, variant, size, className, children, external }: { to: string; variant?: Variant; size?: Size; className?: string; children: ReactNode; external?: boolean }) {
  if (external || /^https?:|^mailto:|^tel:/.test(to)) {
    return <a href={to} target={to.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className={buttonClass(variant, size, className)}>{children}</a>;
  }
  return <Link to={to} className={buttonClass(variant, size, className)}>{children}</Link>;
}
