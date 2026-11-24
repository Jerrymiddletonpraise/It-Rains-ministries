import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, Lock, BookOpen, Calendar, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { enabled } from "@/lib/env";
import { getMedia, resolveMediaUrl, type MediaRow } from "@/lib/data";
import { ButtonLink, PageHero, Section } from "@/components/ui";
import { SermonCard } from "@/components/cards";
import { formatDate, MEDIA_CATEGORIES, toEmbedUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function load(slug: string) {
  if (!enabled.supabase) return { item: null, locked: false };
  const s = await createClient();
  const { data } = await s.from("media_items").select("*").eq("slug", slug).maybeSingle();
  if (data) return { item: data as MediaRow, locked: false };
  if (enabled.serviceRole) {
    const { data: hidden } = await createAdminClient().from("media_items").select("title,members_only,published").eq("slug", slug).maybeSingle();
    if (hidden?.published && hidden.members_only) return { item: { title: hidden.title } as MediaRow, locked: true };
  }
  return { item: null, locked: false };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { item } = await load((await params).slug);
  return item ? { title: item.title, description: item.description?.slice(0, 160), openGraph: { images: item.thumbnail_url ? [item.thumbnail_url] : [] } } : {};
}

export default async function SermonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { item: m, locked } = await load(slug);
  if (!m) notFound();
  if (locked) return (
    <>
      <PageHero eyebrow="Members only" title={m.title} />
      <Section><div className="mx-auto max-w-lg rounded-3xl bg-white p-10 text-center shadow">
        <Lock className="mx-auto h-12 w-12 text-royal-700" /><p className="mt-4 text-lg">This message is available to registered members.</p>
        <div className="mt-6 flex justify-center gap-3"><ButtonLink href={`/login?next=/sermons/${slug}`} variant="purple">Sign in</ButtonLink><ButtonLink href="/register" variant="ghost">Create free account</ButtonLink></div>
      </div></Section>
    </>
  );
  const s = await createClient();
  await s.rpc("increment_media_views", { m: m.id });
  const embed = toEmbedUrl(m.video_url);
  const [videoSrc, audioSrc, related] = await Promise.all([
    embed ? null : resolveMediaUrl(m.video_url), resolveMediaUrl(m.audio_url), getMedia({ category: m.category, limit: 4 }),
  ]);
  return (
    <div className="pt-20">
      <div className="bg-navy-950 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-5xl">
          {embed ? (
            <div className="relative aspect-video overflow-hidden rounded-2xl"><iframe src={embed} title={m.title} className="absolute inset-0 h-full w-full" allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen /></div>
          ) : videoSrc ? (
            <video src={videoSrc} controls playsInline preload="metadata" poster={m.thumbnail_url ?? undefined} className="aspect-video w-full rounded-2xl bg-black" />
          ) : m.thumbnail_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={m.thumbnail_url} alt="" className="aspect-video w-full rounded-2xl object-cover" />
          ) : null}
          {audioSrc && <audio src={audioSrc} controls preload="metadata" className="mt-4 w-full" />}
        </div>
      </div>
      <Section className="pt-10 md:pt-12">
        <div className="mx-auto max-w-5xl">
          <Link href={`/sermons?category=${m.category}`} className="text-xs font-bold uppercase tracking-widest text-gold-600">{MEDIA_CATEGORIES[m.category]}</Link>
          <h1 className="mt-2 font-serif text-4xl font-bold md:text-5xl">{m.title}</h1>
          <div className="mt-4 flex flex-wrap gap-5 text-sm text-navy-800/70">
            {m.speaker && <span className="flex items-center gap-1.5"><UserRound className="h-4 w-4" />{m.speaker}</span>}
            {m.preached_on && <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{formatDate(m.preached_on)}</span>}
            {m.scripture && <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4" />{m.scripture}</span>}
          </div>
          {m.description && <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-navy-800/85">{m.description}</p>}
          {m.file_path && (
            <a href={`/api/media/${m.id}/download`} className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold-500 px-6 py-3 font-semibold text-navy-950"><Download className="h-4 w-4" />Download resource</a>
          )}
          {related.filter((r) => r.id !== m.id).length > 0 && (
            <>
              <h2 className="mb-6 mt-16 font-serif text-3xl font-bold">More like this</h2>
              <div className="grid gap-6 md:grid-cols-3">{related.filter((r) => r.id !== m.id).slice(0, 3).map((r) => <SermonCard key={r.id} m={r} />)}</div>
            </>
          )}
        </div>
      </Section>
    </div>
  );
}
