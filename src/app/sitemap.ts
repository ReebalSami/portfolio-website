import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getConfig } from "@/lib/config";
import { getAllPosts } from "@/lib/mdx";

function localeAlternates(path = ""): MetadataRoute.Sitemap[number]["alternates"] {
  const base = getConfig().site.url.replace(/\/$/, "");
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    languages[locale] = `${base}/${locale}${path}`;
  }
  languages["x-default"] = `${base}/${routing.defaultLocale}${path}`;
  return { languages };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const config = getConfig();
  const base = config.site.url.replace(/\/$/, "");
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    entries.push({
      url: `${base}/${locale}`,
      alternates: localeAlternates(),
      changeFrequency: "weekly",
      priority: 1,
    });

    const posts = getAllPosts(locale);
    for (const post of posts) {
      const blogPath = `/blog/${post.slug}`;
      entries.push({
        url: `${base}/${locale}${blogPath}`,
        lastModified: post.date ? new Date(post.date) : undefined,
        alternates: localeAlternates(blogPath),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  return entries;
}
