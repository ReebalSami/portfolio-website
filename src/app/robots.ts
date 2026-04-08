import type { MetadataRoute } from "next";
import { getConfig } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  const config = getConfig();

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: ["/api/"],
      },
    ],
    sitemap: `${config.site.url}/sitemap.xml`,
  };
}
