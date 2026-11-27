import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function Layout() {
  const { pathname, hash } = useLocation();
  useEffect(() => { if (!hash) window.scrollTo({ top: 0 }); }, [pathname, hash]);
  return (
    <>
      <a href="#main" className="sr-only z-[60] rounded-full bg-gold px-4 py-2 text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to content</a>
      <Header />
      <main id="main" tabIndex={-1} className="min-h-[60vh] focus:outline-none"><Outlet /></main>
      <Footer />
    </>
  );
}
