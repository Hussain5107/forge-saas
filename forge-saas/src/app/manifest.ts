import type { MetadataRoute } from "next";

// Forces every request for /manifest.json to be dynamically rendered
// (no caching), so Android/Chrome always fetches the current name and
// icons instead of a stale cached copy from before an update.
export const dynamic = "force-dynamic";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FORGE",
    short_name: "FORGE",
    description: "Personalized 6-day Push/Pull/Legs program, workout logging, and progress tracking.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#0a0b0f",
    theme_color: "#0a0b0f",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
