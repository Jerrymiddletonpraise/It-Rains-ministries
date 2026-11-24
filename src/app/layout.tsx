import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { WhatsappButton } from "@/components/layout/WhatsappButton";
import { env } from "@/lib/env";

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-cormorant", display: "swap" });
const sans = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: { default: "IT RAINS MINISTRIES | Where Heaven's Abundance Rains Upon Lives", template: "%s | IT RAINS MINISTRIES" },
  description: "IT RAINS MINISTRIES is a global digital church and ministry. Watch live services, listen to sermons, submit prayer requests, give online and join a worshipping family from anywhere in the world.",
  keywords: ["church", "ministry", "live church service", "online worship", "prayer request", "sermons", "IT RAINS MINISTRIES"],
  openGraph: { type: "website", siteName: "IT RAINS MINISTRIES", locale: "en_US" },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/icon.svg" },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = { themeColor: "#0b1033", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <WhatsappButton />
        <CookieConsent gaId={env.gaId || undefined} />
      </body>
    </html>
  );
}
