import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "IT RAINS MINISTRIES", short_name: "IT RAINS", description: "Where Heaven's Abundance Rains Upon Lives.",
    start_url: "/", display: "standalone", background_color: "#0b1033", theme_color: "#0b1033",
    icons: [{ src: "/logo.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
