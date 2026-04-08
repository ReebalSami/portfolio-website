import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getTranslations } from "next-intl/server";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeShiki from "@shikijs/rehype";
import { getPostBySlug, getAllSlugs } from "@/lib/mdx";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { JsonLd } from "@/components/seo/json-ld";
import { getConfig } from "@/lib/config";
import {
  buildLanguageAlternates,
  buildLocaleUrl,
  buildAbsoluteUrl,
  getMetadataBase,
  ogLocale,
  resolveTwitterCard,
  resolveTwitterHandle,
} from "@/lib/seo";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getAllSlugs(locale).map((slug) => ({ locale, slug }))
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getPostBySlug(slug, locale);
  if (!post) {
    return {
      metadataBase: getMetadataBase(),
      title: getConfig().site.name,
    };
  }

  const config = getConfig();
  const metadataBase = getMetadataBase();
  const pagePath = `/blog/${slug}`;
  const canonical = buildLocaleUrl(locale, pagePath);
  const languages = buildLanguageAlternates(pagePath);
  const description = post.description || config.site.description;

  const ogImageUrl = config.seo.ogImage
    ? buildAbsoluteUrl(config.seo.ogImage)
    : buildLocaleUrl(locale, "/opengraph-image");

  return {
    metadataBase,
    title: post.title,
    description,
    keywords: post.tags,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      type: "article",
      locale: ogLocale(locale),
      url: canonical,
      title: post.title,
      description,
      publishedTime: post.date,
      authors: [config.site.name],
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: resolveTwitterCard(),
      title: post.title,
      description,
      creator: resolveTwitterHandle(),
      images: [ogImageUrl],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const post = getPostBySlug(slug, locale);
  if (!post) notFound();
  const t = await getTranslations("blog");
  const config = getConfig();
  const articleUrl = buildLocaleUrl(locale, `/blog/${post.slug}`);
  const ogImageUrl = config.seo.ogImage
    ? buildAbsoluteUrl(config.seo.ogImage)
    : buildLocaleUrl(locale, "/opengraph-image");
  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Person",
      name: config.site.name,
      url: config.site.url,
    },
    publisher: {
      "@type": "Person",
      name: config.site.name,
      url: config.site.url,
    },
    url: articleUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    inLanguage: locale,
    image: ogImageUrl,
    keywords: post.tags.join(", "),
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-24">
      <JsonLd id={`blogpost-structured-data-${post.slug}`} data={blogJsonLd} />
      <Link
        href="/#blog"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("backToBlog")}
      </Link>

      <header className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
          {post.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {new Date(post.date).toLocaleDateString(locale, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {post.readingTime}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </header>

      <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-heading prose-headings:tracking-tight prose-a:text-primary prose-code:before:content-none prose-code:after:content-none">
        <MDXRemote
          source={post.content}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [
                rehypeSlug,
                [rehypeAutolinkHeadings, { behavior: "wrap" }],
                [rehypeShiki, { themes: { light: "github-light", dark: "github-dark" } }],
              ],
            },
          }}
        />
      </article>
    </div>
  );
}
