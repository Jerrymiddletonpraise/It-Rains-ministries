// Decorative golden "rain of glory" streaks (CSS only, respects reduced motion).
export function Rain({ count = 28 }: { count?: number }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }, (_, i) => {
        const left = (i * 37) % 100, delay = (i * 0.53) % 2.6, dur = 2.2 + ((i * 7) % 10) / 10, h = 40 + ((i * 13) % 60);
        return (
          <span key={i} className="absolute top-0 w-px animate-rain bg-gradient-to-b from-transparent via-gold-400/60 to-transparent"
            style={{ left: `${left}%`, height: h, animationDelay: `${delay}s`, animationDuration: `${dur}s` }} />
        );
      })}
    </div>
  );
}
