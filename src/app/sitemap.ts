import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getConfig } from "@/lib/config";
import { getAllPosts } from "@/lib/mdx";

export default function sitemap(): MetadataRoute.Sitemap {
  const config = getConfig();
  const entries: MetadataRoute.Sitemap = [];

  routing.locales.forEach((locale) => {
    const localeBase = `${config.site.url}/${locale}`;

    entries.push({
      url: localeBase,
      changeFrequency: "weekly",
      priority: 1,
    });

    const posts = getAllPosts(locale);
    posts.forEach((post) => {
      entries.push({
        url: `${localeBase}/blog/${post.slug}`,
        lastModified: post.date ? new Date(post.date) : undefined,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    });
  });

  return entries;
}
