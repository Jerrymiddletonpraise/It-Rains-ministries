import "server-only";

/**
 * Free, key-less check for "is our YouTube channel live right now?".
 * Reads the public https://www.youtube.com/<channel>/live page, which YouTube
 * points at the current live video while a broadcast is on. Cached for 60 seconds
 * so YouTube is asked at most once a minute however many people open /watch.
 * Returns null when not live, when no channel is set, or if YouTube changes the page.
 */
export function channelLivePage(channelUrl: string | null | undefined) {
  if (!channelUrl) return null;
  try {
    const u = new URL(channelUrl);
    if (!u.hostname.endsWith("youtube.com")) return null;
    const [first, second] = u.pathname.split("/").filter(Boolean);
    if (!first) return null;
    if (first.startsWith("@")) return `https://www.youtube.com/${first}/live`;
    if (["channel", "c", "user"].includes(first) && second) return `https://www.youtube.com/${first}/${second}/live`;
  } catch {}
  return null;
}

export async function detectYoutubeLive(channelUrl: string | null | undefined): Promise<{ videoId: string; title: string; url: string } | null> {
  const page = channelLivePage(channelUrl);
  if (!page) return null;
  try {
    const res = await fetch(page, {
      headers: { "accept-language": "en-US,en;q=0.9", cookie: "SOCS=CAI; CONSENT=YES+1", "user-agent": "Mozilla/5.0 (compatible; MinistryWebsite/1.0)" },
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    if (!/"isLiveNow":\s*true/.test(html)) return null;
    const id = html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([\w-]{11})"/)?.[1];
    if (!id) return null;
    const title = (html.match(/<meta name="title" content="([^"]*)"/)?.[1] ?? "Live service")
      .replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"');
    return { videoId: id, title, url: `https://www.youtube.com/watch?v=${id}` };
  } catch {
    return null;
  }
}
