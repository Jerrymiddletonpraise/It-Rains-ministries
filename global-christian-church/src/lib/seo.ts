import { useEffect } from "react";

const SITE = "Global Christian Church";

/** Sets the document title and description for a route (client-side SEO). */
export function useSeo(title: string, description?: string) {
  useEffect(() => {
    document.title = title === SITE ? `${SITE} | One Faith. One Family. Reaching the World.` : `${title} | ${SITE}`;
    if (description) {
      let tag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (!tag) { tag = document.createElement("meta"); tag.name = "description"; document.head.appendChild(tag); }
      tag.content = description;
      document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute("content", document.title);
      document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute("content", description);
    }
  }, [title, description]);
}
