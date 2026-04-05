---
name: skill-08-blog
description: Set up MDX blog with syntax highlighting, table of contents, reading time, and RSS feed
---

## Skill 08: Blog (MDX)

### Goal
Full-featured MDX blog with syntax highlighting, reading time, ToC, and RSS feed.

### Prerequisites
Skill 03 completed.

### GitHub
- **Milestone**: M3: Content & Features
- **Issue**: "Skill 08: Blog (MDX)"
- **Branch**: `feat/skill-08-blog`

### Steps

1. **MDX setup**: `next-mdx-remote` + Shiki + `remark-gfm` + `rehype-slug` + `rehype-autolink-headings`

2. **Frontmatter schema**:
   ```yaml
   title: "..."
   description: "..."
   date: "2026-04-15"
   tags: ["LLM", "Python"]
   locale: "en"
   published: true
   ```

3. **BlogCard** component (title, date, tags, reading time, excerpt)

4. **Blog listing** (`/blog`) — cards sorted by date

5. **Blog post** (`/blog/[slug]`):
   - Title, date, reading time, tags
   - Auto-generated ToC from headings
   - Code blocks with copy button + theme
   - Previous/Next navigation

6. **RSS feed** at `/feed.xml` (build-time generated)

7. **Posts per locale**: `src/content/blog/{en,de,es,ar}/`

8. **One sample post** per locale (even if short placeholder)

### Acceptance Criteria
- [ ] Blog listing shows posts
- [ ] Post renders MDX with syntax highlighting
- [ ] ToC works
- [ ] RSS valid XML
- [ ] Reading time calculates
- [ ] Code copy button works
- [ ] **Show local demo to Reebal before pushing**
