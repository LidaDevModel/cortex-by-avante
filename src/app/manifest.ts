import type { MetadataRoute } from "next";

/**
 * Web app manifest. Its job here is the ORIENTATION declaration: installed to
 * a guard's home screen, Cortex opens and stays in portrait.
 *
 * This is the only place a portrait preference can actually be ENFORCED. In an
 * ordinary browser tab no page can lock orientation — `screen.orientation.lock`
 * requires fullscreen or an installed app — so the tab case is handled by the
 * rotate notice instead (see `components/rotate-notice.tsx`).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Avante Cortex",
    short_name: "Cortex",
    description: "AI-powered knowledge and training platform for Avante Security",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f8faf8",
    theme_color: "#1a4a2e",
  };
}
