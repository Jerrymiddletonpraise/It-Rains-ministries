import Link from "next/link";

/** IT RAINS MINISTRIES mark: a crown-like cloud with falling rays of rain around a cross. */
export function LogoMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="irm-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f5e6b3" />
          <stop offset="0.5" stopColor="#d4af37" />
          <stop offset="1" stopColor="#b8912a" />
        </linearGradient>
        <linearGradient id="irm-purple" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7646c8" />
          <stop offset="1" stopColor="#3b1670" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="31" fill="url(#irm-purple)" stroke="url(#irm-gold)" strokeWidth="2" />
      <path d="M16 30c0-5 4-8.5 8.5-8 1.5-4.5 5.5-7.5 10-7.5 6 0 10.5 4.5 10.8 10.2 3.4.4 6 3.2 6 6.8 0 3.8-3 6.5-6.8 6.5H22.5C18.9 38 16 34.9 16 30z" fill="url(#irm-gold)" />
      <path d="M32 18.5v15M26.5 24h11" stroke="#3b1670" strokeWidth="2.6" strokeLinecap="round" />
      {[22, 28, 34, 40].map((x, i) => (
        <path key={x} d={`M${x} ${42 + (i % 2) * 2}l-2 6`} stroke="url(#irm-gold)" strokeWidth="2.4" strokeLinecap="round" />
      ))}
    </svg>
  );
}

export function Logo({ light = true }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label="IT RAINS MINISTRIES home">
      <LogoMark />
      <span className="leading-tight">
        <span className={`block font-serif text-xl font-bold tracking-[0.12em] ${light ? "text-white" : "text-navy-900"}`}>IT RAINS</span>
        <span className="block text-[0.65rem] font-semibold tracking-[0.35em] text-gold-500">MINISTRIES</span>
      </span>
    </Link>
  );
}
