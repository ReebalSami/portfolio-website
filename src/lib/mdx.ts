import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";

// Every fs operation uses `path.join(process.cwd(), "src/content/blog", ...)`
// inline so Turbopack's NFT tracer can statically scope reads to this
// subfolder. Passing around a computed `blogDir` variable breaks the static
// trace and causes Turbopack to mark the whole project as traced
// ("Encountered unexpected file in NFT list"), bloating the standalone bundle.
// The `/*turbopackIgnore: true*/` hint on `process.cwd()` is the officially
// recommended escape hatch per the warning text itself.

// Draft gate: in production a post with `published: false` is hidden from
// listings, static params, and direct URLs (→ 404). In dev all posts are
// visible so drafts can be previewed locally. Toggle `published: true` in
// the MDX frontmatter when ready to publish.
const isProd = process.env.NODE_ENV === "production";
const isVisible = (published: boolean) => published || !isProd;

function listMdxFiles(locale: string): string[] | null {
  const dir = path.join(
    /*turbopackIgnore: true*/ process.cwd(),
    "src/content/blog",
    locale,
  );
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"));
  return files.length > 0 ? files : null;
}

function resolveLocale(locale: string): string {
  return listMdxFiles(locale) ? locale : "en";
}

function readMdxFile(locale: string, filename: string): string | null {
  const filePath = path.join(
    /*turbopackIgnore: true*/ process.cwd(),
    "src/content/blog",
    locale,
    filename,
  );
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, "utf-8");
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
  const effectiveLocale = resolveLocale(locale);
  const files = listMdxFiles(effectiveLocale);
  if (!files) return [];

  return files
    .map((filename) => {
      const slug = filename.replace(/\.mdx$/, "");
      const raw = readMdxFile(effectiveLocale, filename);
      if (!raw) return null;
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
      } satisfies BlogPostMeta;
    })
    .filter((post): post is BlogPostMeta => post !== null && isVisible(post.published))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string, locale = "en"): BlogPost | null {
  const effectiveLocale = resolveLocale(locale);
  const raw = readMdxFile(effectiveLocale, `${slug}.mdx`);
  if (!raw) return null;

  const { data, content } = matter(raw);
  const published = data.published !== false;
  if (!isVisible(published)) return null;
  const stats = readingTime(content);

  return {
    slug,
    title: data.title ?? slug,
    description: data.description ?? "",
    date: data.date ?? "",
    tags: data.tags ?? [],
    published,
    readingTime: stats.text,
    content,
  };
}

export function getAllSlugs(locale = "en"): string[] {
  const effectiveLocale = resolveLocale(locale);
  const files = listMdxFiles(effectiveLocale);
  if (!files) return [];
  return files
    .map((filename) => {
      const slug = filename.replace(/\.mdx$/, "");
      const raw = readMdxFile(effectiveLocale, filename);
      if (!raw) return null;
      const { data } = matter(raw);
      const published = data.published !== false;
      return isVisible(published) ? slug : null;
    })
    .filter((slug): slug is string => slug !== null);
}
