import type { MetadataRoute } from "next";
import { getConfig } from "@/lib/config";

export default function manifest(): MetadataRoute.Manifest {
  const config = getConfig();

  return {
    name: `${config.site.name} — ${config.site.title}`,
    short_name: config.site.name,
    description: config.site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#faf9f7",
    theme_color: "#18181B",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
