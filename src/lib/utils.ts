export function cn(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

export function slugify(s: string) {
  return s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_-]+/g, "-").slice(0, 80);
}

export function formatMoney(cents: number, currency = "usd") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);
}

export function formatDate(d: string | Date, opts: Intl.DateTimeFormatOptions = { dateStyle: "medium" }, timeZone?: string) {
  return new Intl.DateTimeFormat("en-US", { ...opts, timeZone }).format(new Date(d));
}

export function formatDateTime(d: string | Date, timeZone?: string) {
  return formatDate(d, { dateStyle: "full", timeStyle: "short" }, timeZone);
}

/** Converts a YouTube / Vimeo watch URL into an embeddable URL, or returns null. */
export function toEmbedUrl(url?: string | null) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}`;
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname.startsWith("/embed/")) return url;
      if (u.pathname.startsWith("/live/")) return `https://www.youtube-nocookie.com/embed/${u.pathname.split("/")[2]}`;
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube-nocookie.com/embed/${v}`;
      const ch = u.searchParams.get("channel");
      if (ch) return `https://www.youtube.com/embed/live_stream?channel=${ch}`;
    }
    if (u.hostname.includes("vimeo.com")) return `https://player.vimeo.com/video/${u.pathname.split("/").filter(Boolean).pop()}`;
  } catch {}
  return null;
}

export function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export const MEDIA_CATEGORIES: Record<string, string> = {
  sunday_service: "Sunday Services",
  bible_study: "Wednesday Bible Study",
  prayer_meeting: "Friday Prayer Meetings",
  revival: "Revival Services",
  conference: "Conferences & Crusades",
  teaching: "Pastor's Teachings",
  inspirational: "Inspirational Videos",
  audio: "Audio Sermons",
  resource: "Downloadable Resources",
  live_replay: "Live Service Replays",
};

export const FUNDS: Record<string, { label: string; description: string }> = {
  offering: { label: "Offering", description: "A freewill offering of worship and thanksgiving." },
  tithe: { label: "Tithe", description: "Honouring God with the first tenth." },
  special: { label: "Special Donation", description: "A seed toward a special need or thanksgiving." },
  projects: { label: "Ministry Projects", description: "Buildings, equipment and ministry growth." },
  missions: { label: "Missions & Outreach", description: "Evangelism, crusades and community care." },
};
