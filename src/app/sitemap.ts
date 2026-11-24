import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { getDepartments, getMedia, getUpcomingEvents } from "@/lib/data";

export const revalidate = 3600;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ["", "/about", "/vision-mission", "/pastor", "/watch", "/sermons", "/ministries", "/prayer", "/testimonies", "/give", "/events", "/bible-study", "/register", "/login", "/contact", "/faq", "/privacy", "/terms"];
  const [deps, media, events] = await Promise.all([getDepartments(), getMedia({ limit: 200 }).catch(() => []), getUpcomingEvents(100).catch(() => [])]);
  return [
    ...pages.map((p) => ({ url: `${env.siteUrl}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...deps.map((d) => ({ url: `${env.siteUrl}/ministries/${d.slug}` })),
    ...media.map((m) => ({ url: `${env.siteUrl}/sermons/${m.slug}`, lastModified: m.created_at })),
    ...events.map((e) => ({ url: `${env.siteUrl}/events/${e.slug}` })),
  ];
}
