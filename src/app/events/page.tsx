import type { Metadata } from "next";
import { getUpcomingEvents } from "@/lib/data";
import { Empty, PageHero, Section } from "@/components/ui";
import { EventCard } from "@/components/cards";

export const metadata: Metadata = { title: "Events and Programs" };
export const revalidate = 60;

const CATS = ["all", "conference", "revival", "worship night", "prayer retreat", "bible conference", "youth", "online", "program"];

export default async function Events({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category = "all" } = await searchParams;
  const all = await getUpcomingEvents(100);
  const events = category === "all" ? all : category === "online" ? all.filter((e) => e.is_online) : all.filter((e) => e.category.toLowerCase() === category);
  return (
    <>
      <PageHero eyebrow="Events & programs" title="Gather with us" intro="Conferences, revivals, worship nights, retreats and programs, in person and online." />
      <Section>
        <div className="mb-8 flex flex-wrap gap-2">
          {CATS.map((c) => (
            <a key={c} href={c === "all" ? "/events" : `/events?category=${encodeURIComponent(c)}`}
              className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${c === category ? "bg-royal-700 text-white" : "bg-white text-navy-800 ring-1 ring-navy-900/10"}`}>{c}</a>
          ))}
        </div>
        {events.length ? <div className="grid gap-5 md:grid-cols-2">{events.map((e) => <EventCard key={e.id} e={e} />)}</div>
          : <Empty title="No upcoming events in this category">Check back soon or subscribe to our newsletter.</Empty>}
      </Section>
    </>
  );
}
