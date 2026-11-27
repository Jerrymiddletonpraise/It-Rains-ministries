import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { demoSermons } from "@/lib/demo";
import type { Sermon } from "@/lib/types";
import { useSeo } from "@/lib/seo";
import { formatDate, toEmbedUrl } from "@/lib/utils";
import { AwaitingBadge, DemoBadge, Section, Spinner } from "@/components/ui/Misc";
import { ButtonLink } from "@/components/ui/Button";
import { Artwork, sermonKindLabel } from "@/components/Cards";
import NotFound from "./NotFound";

export default function SermonDetail() {
  const { slug } = useParams();
  const [s, setS] = useState<Sermon | null | undefined>(undefined);
  const [isDemo, setIsDemo] = useState(false);
  useEffect(() => {
    const demo = demoSermons.find((d) => d.slug === slug) ?? null;
    if (!supabase) { setS(demo); setIsDemo(Boolean(demo)); return; }
    supabase.from("sermons").select("*").eq("slug", slug!).eq("status", "published").maybeSingle().then(({ data }) => {
      if (data) { setS(data as Sermon); setIsDemo(false); } else { setS(demo); setIsDemo(Boolean(demo)); }
    });
  }, [slug]);
  useSeo(s?.title ?? "Sermon", s?.description ?? undefined);
  if (s === undefined) return <div className="pt-32"><Spinner /></div>;
  if (!s) return <NotFound />;
  const embed = toEmbedUrl(s.video_url);
  return (
    <Section className="pt-32">
      <Link to="/sermons" className="mb-8 inline-flex items-center gap-2 text-sm text-ivory-muted hover:text-gold"><ArrowLeft className="h-4 w-4" aria-hidden />Sermon library</Link>
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="relative aspect-video overflow-hidden rounded-2xl border border-line bg-black">
            {embed ? <iframe src={embed} title={s.title} className="absolute inset-0 h-full w-full" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
              : s.video_url ? <video src={s.video_url} controls className="h-full w-full" preload="metadata" />
              : <Artwork seed={s.id} title={s.title} className="h-full w-full" />}
          </div>
          {s.audio_url && <audio src={s.audio_url} controls preload="none" className="mt-6 w-full" />}
          {!s.video_url && !s.audio_url && <AwaitingBadge className="mt-4" label="Media file not uploaded yet" />}
        </div>
        <div>
          {isDemo && <DemoBadge className="mb-4" />}
          <p className="eyebrow">{sermonKindLabel(s.kind)}{s.series && ` · ${s.series}`}</p>
          <h1 className="mt-3 text-4xl sm:text-5xl">{s.title}</h1>
          <dl className="mt-6 space-y-2 text-sm text-ivory-muted">
            {s.speaker && <div><dt className="inline font-semibold text-ivory">Speaker: </dt><dd className="inline">{s.speaker}</dd></div>}
            {s.scripture_reference && <div><dt className="inline font-semibold text-ivory">Scripture: </dt><dd className="inline">{s.scripture_reference}</dd></div>}
            {s.preached_on && <div><dt className="inline font-semibold text-ivory">Date: </dt><dd className="inline">{formatDate(s.preached_on, { dateStyle: "long" })}</dd></div>}
          </dl>
          {s.description && <p className="mt-6 leading-relaxed text-ivory-muted">{s.description}</p>}
          {s.notes_url && <ButtonLink to={s.notes_url} external variant="outline" className="mt-8"><Download className="h-4 w-4" aria-hidden />Download sermon notes</ButtonLink>}
        </div>
      </div>
    </Section>
  );
}
