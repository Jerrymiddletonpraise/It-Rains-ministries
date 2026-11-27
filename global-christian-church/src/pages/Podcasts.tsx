import { useSeo } from "@/lib/seo";
import { demoSermons } from "@/lib/demo";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Misc";
import { MediaBrowser } from "./Sermons";

export default function Podcasts() {
  useSeo("Podcasts", "Listen to Global Christian Church podcasts anywhere.");
  return (
    <>
      <PageHero eyebrow="Listen" title="Podcasts" intro="Faith-filled conversations and teaching for the journey." />
      <Section><MediaBrowser kinds={["podcast"]} demo={demoSermons} /></Section>
    </>
  );
}
