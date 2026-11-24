import Link from "next/link";
import { useId } from "react";

/**
 * IT RAINS MINISTRIES mark: a faceted hexagon (a jewel / open heaven) holding a
 * cross that rises out of a single-line cloud, with streaks of "digital rain" below.
 */
export function LogoMark({ className = "h-10 w-10" }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff3c4" />
          <stop offset="0.45" stopColor="#e6c35c" />
          <stop offset="1" stopColor="#b8862a" />
        </linearGradient>
        <linearGradient id={`p${id}`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#6d35d6" />
          <stop offset="0.6" stopColor="#2c1170" />
          <stop offset="1" stopColor="#0b1033" />
        </linearGradient>
        <linearGradient id={`r${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f5d97a" />
          <stop offset="1" stopColor="#f5d97a" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M32 2.5 58 17.5v29L32 61.5 6 46.5v-29z" fill={`url(#p${id})`} stroke={`url(#g${id})`} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M32 9 52 20.5" stroke="#ffffff" strokeOpacity=".25" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M19.5 35.5a7 7 0 0 1 3.2-12.8 10.5 10.5 0 0 1 19.8-1.2 7.2 7.2 0 0 1 2.3 14" fill="none" stroke={`url(#g${id})`} strokeWidth="3" strokeLinecap="round" />
      <path d="M32 12.5v26M25.5 20h13" stroke="#ffffff" strokeWidth="3.4" strokeLinecap="round" />
      {[[22, 41, 9], [28.5, 43, 11], [35.5, 43, 11], [42, 41, 9]].map(([x, y, l]) => (
        <path key={x} d={`M${x} ${y}l-2.6 ${l}`} stroke={`url(#r${id})`} strokeWidth="2.6" strokeLinecap="round" />
      ))}
    </svg>
  );
}

/** Bold, futuristic wordmark. */
export function Wordmark({ light = true, sub = "MINISTRIES", className = "" }: { light?: boolean; sub?: string; className?: string }) {
  return (
    <span className={`leading-none ${className}`}>
      <span className={`block font-display text-[1.35rem] font-black uppercase tracking-[0.08em] ${light ? "text-chrome" : "text-navy-900"}`}>IT RAINS</span>
      <span className="mt-1 block font-display text-[0.6rem] font-semibold tracking-[0.52em] text-gold-400">{sub}</span>
    </span>
  );
}

export function Logo({ light = true }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label="IT RAINS MINISTRIES home">
      <LogoMark className="h-11 w-11 drop-shadow-[0_0_12px_rgba(230,195,92,0.35)]" />
      <Wordmark light={light} />
    </Link>
  );
}
