import { cn } from "@/lib/utils";

/** GCC mark: a globe of meridians crowned by a cross, in champagne gold and ivory. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn("h-10 w-10", className)} role="img" aria-label="Global Christian Church emblem">
      <defs>
        <linearGradient id="gcc-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="hsl(41 58% 80%)" /><stop offset=".55" stopColor="hsl(39 47% 66%)" /><stop offset="1" stopColor="hsl(36 38% 48%)" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="none" stroke="url(#gcc-gold)" strokeWidth="1.2" opacity=".55" />
      <g fill="none" stroke="url(#gcc-gold)" strokeWidth="1.8">
        <circle cx="32" cy="33" r="20" />
        <ellipse cx="32" cy="33" rx="9" ry="20" />
        <path d="M12.6 27h38.8M12.6 39h38.8" opacity=".7" />
      </g>
      <path d="M32 6v48M23 17h18" stroke="hsl(42 50% 95%)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <LogoMark />
      <span className="leading-none">
        <span className="block font-display text-[1.15rem] font-semibold tracking-[0.2em] text-ivory sm:text-xl">GLOBAL CHRISTIAN</span>
        {!compact && <span className="mt-1 block text-[0.6rem] font-semibold uppercase tracking-[0.5em] text-gold">Church</span>}
      </span>
    </span>
  );
}
