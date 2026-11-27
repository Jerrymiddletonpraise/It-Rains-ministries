import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { dateStyle: "medium" }) {
  try { return new Intl.DateTimeFormat(undefined, opts).format(new Date(iso)); } catch { return iso; }
}

export function formatDateTime(iso: string) {
  return formatDate(iso, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" });
}

export function slugify(s: string) {
  return s.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/** Turns a YouTube, Facebook or direct video URL into an embeddable src, or null if unsupported. */
export function toEmbedUrl(raw?: string | null): string | null {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    if (u.hostname.includes("youtube.com") || u.hostname === "youtu.be") {
      if (u.pathname.startsWith("/embed/")) return raw;
      const id = u.hostname === "youtu.be" ? u.pathname.slice(1) : u.searchParams.get("v") ?? u.pathname.split("/live/")[1];
      return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0` : null;
    }
    if (u.hostname.includes("facebook.com")) {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(raw)}&show_text=false`;
    }
    if (u.hostname.includes("player.restream.io") || u.hostname.includes("player.vimeo.com") || u.hostname.includes("player.twitch.tv")) return raw;
    return null;
  } catch { return null; }
}
