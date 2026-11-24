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
    if (u.hostname.endsWith("facebook.com") || u.hostname === "fb.watch") return facebookEmbedUrl(url);
  } catch {}
  return null;
}

/** Facebook's official video player: works for public Facebook Live and video posts. */
export function facebookEmbedUrl(url?: string | null) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (!(u.hostname.endsWith("facebook.com") || u.hostname === "fb.watch")) return null;
    if (u.pathname.startsWith("/plugins/video.php")) return url;
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=1280`;
  } catch { return null; }
}

export type PlatformLink = { key: string; label: string; url: string; embed: string | null };

/**
 * Every place a broadcast can be watched. YouTube and Facebook allow their live
 * players on other websites; Instagram, TikTok and most other apps only allow
 * links, so those open in the app.
 */
export function streamPlatforms(s: {
  youtube_url?: string | null; facebook_url?: string | null; instagram_url?: string | null;
  tiktok_url?: string | null; extra_links?: { label: string; url: string }[] | null;
}): PlatformLink[] {
  const list: PlatformLink[] = [];
  const ok = (v?: string | null) => { try { return v && ["http:", "https:"].includes(new URL(v).protocol) ? v : null; } catch { return null; } };
  const yt = ok(s.youtube_url), fb = ok(s.facebook_url), ig = ok(s.instagram_url), tt = ok(s.tiktok_url);
  if (yt) list.push({ key: "youtube", label: "YouTube", url: yt, embed: toEmbedUrl(yt) });
  if (fb) list.push({ key: "facebook", label: "Facebook", url: fb, embed: facebookEmbedUrl(fb) });
  if (ig) list.push({ key: "instagram", label: "Instagram", url: ig, embed: null });
  if (tt) list.push({ key: "tiktok", label: "TikTok", url: tt, embed: null });
  for (const l of s.extra_links ?? []) {
    const u = ok(l?.url);
    if (u) list.push({ key: `extra-${list.length}`, label: String(l.label || new URL(u).hostname).slice(0, 40), url: u, embed: toEmbedUrl(u) });
  }
  return list;
}

/** Parses "Label | https://…" lines (one per line) from an admin textarea. */
export function parseExtraLinks(text: string) {
  return text.split("\n").map((line) => {
    const [a, b] = line.includes("|") ? line.split("|") : ["", line];
    const url = (b ?? "").trim();
    try { if (!["http:", "https:"].includes(new URL(url).protocol)) return null; } catch { return null; }
    return { label: a.trim() || new URL(url).hostname.replace(/^www\./, ""), url };
  }).filter(Boolean).slice(0, 10) as { label: string; url: string }[];
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
