import type { Metadata } from "next";
import { Radio, Calendar } from "lucide-react";
import { getCurrentStream, getMedia, getSetting } from "@/lib/data";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/roles";
import { enabled } from "@/lib/env";
import { LivePlayer } from "@/components/live/LivePlayer";
import { LiveChat } from "@/components/live/LiveChat";
import { LiveRefresher } from "@/components/live/LiveRefresher";
import { NotifyButton } from "@/components/live/NotifyButton";
import { SermonCard } from "@/components/cards";
import { ButtonLink, Card, Empty, Heading, Section } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";
import { detectYoutubeLive } from "@/lib/youtube";
import { YoutubeIcon } from "@/components/ui/SocialIcons";

export const metadata: Metadata = { title: "Watch Live", description: "Watch IT RAINS MINISTRIES church services live from anywhere in the world." };
export const dynamic = "force-dynamic";

export default async function Watch() {
  const [stream, session, replays, services, social] = await Promise.all([getCurrentStream(), getSession(), getMedia({ category: "live_replay", limit: 6 }), getSetting("services"), getSetting("social")]);
  const onAir = stream && ["live", "paused"].includes(stream.status);
  // Nobody created a broadcast here, but the ministry's YouTube channel is live: play it anyway.
  const ytLive = onAir ? null : await detectYoutubeLive(social.youtube);
  return (
    <div className="bg-navy-950 pt-24">
      <LiveRefresher streamId={stream?.id ?? null} />
      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        {onAir && stream ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <div>
              <LivePlayer stream={stream} livekit={enabled.livekit} />
              <h1 className="mt-5 font-serif text-3xl font-bold text-white md:text-4xl">{stream.title}</h1>
              {stream.description && <p className="mt-2 text-white/70">{stream.description}</p>}
              <div className="mt-5 flex flex-wrap gap-3">
                <ButtonLink href="/give">Give during service</ButtonLink>
                <ButtonLink href="/prayer" variant="outline">Prayer request</ButtonLink>
              </div>
            </div>
            <LiveChat streamId={stream.id} signedIn={Boolean(session.user)} isModerator={can(session.roles, "moderation")} chatEnabled={stream.chat_enabled} />
          </div>
        ) : ytLive ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <div>
              <LivePlayer livekit={false} stream={{
                id: `youtube-${ytLive.videoId}`, title: ytLive.title, status: "live", source: "youtube", youtube_url: ytLive.url,
                facebook_url: null, instagram_url: social.instagram || null, tiktok_url: social.tiktok || null,
                extra_links: social.facebook ? [{ label: "Facebook page", url: social.facebook }] : [],
              }} />
              <h1 className="mt-5 font-serif text-3xl font-bold text-white md:text-4xl">{ytLive.title}</h1>
              <div className="mt-5 flex flex-wrap gap-3">
                <ButtonLink href="/give">Give during service</ButtonLink>
                <ButtonLink href="/prayer" variant="outline">Prayer request</ButtonLink>
              </div>
            </div>
            <Card className="h-max">
              <YoutubeIcon className="h-8 w-8 text-red-600" />
              <p className="mt-3 font-serif text-2xl font-bold">Live on our YouTube channel</p>
              <p className="mt-2 text-sm text-navy-800/75">This service is streaming on YouTube right now. Join the live chat there, and send prayer requests to our team from this website.</p>
              <a href={ytLive.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block rounded-full bg-red-600 px-5 py-2.5 text-sm font-bold text-white">Open live chat on YouTube ↗</a>
            </Card>
          </div>
        ) : (
          <div className="bg-heaven rounded-3xl px-6 py-16 text-center text-white md:py-24">
            <Radio className="mx-auto h-14 w-14 text-gold-400" />
            <h1 className="mt-4 font-serif text-4xl font-bold md:text-5xl">We&apos;re not live right now</h1>
            {stream?.scheduled_for ? (
              <p className="mt-4 text-lg text-white/80">Next broadcast: <strong className="text-gold-400">{stream.title}</strong><br />{formatDateTime(stream.scheduled_for)}</p>
            ) : <p className="mt-4 text-lg text-white/80">Join us for our next service. This page goes live automatically when we start.</p>}
            <div className="mt-6"><NotifyButton /></div>
            <div className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">
              {services.map((s) => (
                <div key={s.name} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                  <Calendar className="mx-auto h-5 w-5 text-gold-400" /><p className="mt-2 font-semibold">{s.day} · {s.time}</p><p className="text-sm text-white/65">{s.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Section className="bg-ivory">
        <Heading eyebrow="Replays" title="Previous broadcasts" />
        {replays.length ? <div className="grid gap-6 md:grid-cols-3">{replays.map((m) => <SermonCard key={m.id} m={m} />)}</div>
          : <Empty title="Replays will appear here">Recordings of past services are added to the media library after each broadcast.</Empty>}
        <Card className="mt-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <p className="font-serif text-xl">Looking for a particular message?</p>
          <ButtonLink href="/sermons" variant="purple">Search the media library</ButtonLink>
        </Card>
      </Section>
    </div>
  );
}
