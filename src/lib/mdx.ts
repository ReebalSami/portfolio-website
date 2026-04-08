import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";

const BLOG_BASE = path.resolve(process.cwd(), "src/content/blog");

function getBlogDir(locale: string): string {
  const localeDir = path.join(BLOG_BASE, locale);
  if (fs.existsSync(localeDir) && fs.readdirSync(localeDir).some((f) => f.endsWith(".mdx"))) {
    return localeDir;
  }
  return path.join(BLOG_BASE, "en");
}

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  published: boolean;
  readingTime: string;
}

export interface BlogPost extends BlogPostMeta {
  content: string;
}

export function getAllPosts(locale = "en"): BlogPostMeta[] {
  const blogDir = getBlogDir(locale);
  if (!fs.existsSync(blogDir)) {
    return [];
  }

  const files = fs.readdirSync(blogDir).filter((f) => f.endsWith(".mdx"));

  return files
    .map((filename) => {
      const slug = filename.replace(/\.mdx$/, "");
      const filePath = path.join(blogDir, filename);
      const raw = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(raw);
      const stats = readingTime(content);

      return {
        slug,
        title: data.title ?? slug,
        description: data.description ?? "",
        date: data.date ?? "",
        tags: data.tags ?? [],
        published: data.published !== false,
        readingTime: stats.text,
      };
    })
    .filter((post) => post.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string, locale = "en"): BlogPost | null {
  const blogDir = getBlogDir(locale);
  const filePath = path.join(blogDir, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const stats = readingTime(content);

  return {
    slug,
    title: data.title ?? slug,
    description: data.description ?? "",
    date: data.date ?? "",
    tags: data.tags ?? [],
    published: data.published !== false,
    readingTime: stats.text,
    content,
  };
}

export function getAllSlugs(locale = "en"): string[] {
  const blogDir = getBlogDir(locale);
  if (!fs.existsSync(blogDir)) {
    return [];
  }

  return fs
    .readdirSync(blogDir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}
