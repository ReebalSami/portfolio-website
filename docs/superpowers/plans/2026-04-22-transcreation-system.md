# Transcreation System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Install a section-aware transcreation system on top of the existing next-intl foundation so AR, ES, and DE content reads as native-authored, the chatbot responds per-locale with the correct register, and all locked terms (brand/tech/titles/metrics) stay consistent across files.

**Architecture:**
- YAML glossary (`config/i18n/glossary.yaml`) + Zod loader = single source of truth for locked terms across 4 locales.
- Dev-time CLI (`scripts/transcreate.ts`) uses Claude Opus 4.7 via `@anthropic-ai/sdk` to rewrite content section-by-section, given a glossary + tone matrix + per-locale persona.
- Chatbot API (`src/app/api/chat/route.ts`) receives a `locale` field, loads `chatbot-context.{locale}.md` (fallback EN), and builds a per-locale system prompt.
- Pre-commit hooks (`husky` + TypeScript scripts) verify locale-file key parity and glossary-term consistency before any commit can land.

**Tech stack:** Next.js 16, TypeScript 5.9, Zod v4 (`import from "zod/v4"`), Vitest (unit tests), Playwright (E2E), `@anthropic-ai/sdk` (new), existing `@ai-sdk/openai` kept for chatbot runtime, husky (new).

**Brand voice (binding constraint):** modern, uncomplicated, friendly, competent — uniform across EN/DE/ES/AR. German uses capitalized `Du/Dir/Dich`, never `Sie`. See memory entry `project_brand_voice.md` and the tone-routing skill for per-section detail.

---

## Phase 0 — Prerequisites

### Task 0.1: Confirm baseline

**Files:** none (read-only)

- [ ] **Step 1: Verify you are in the worktree on the right branch**

Run: `pwd && git branch --show-current`
Expected: path ends in `.claude/worktrees/transcreation-system`, branch `feat/transcreation-system`.

- [ ] **Step 2: Verify main builds and tests pass**

Run: `pnpm install --frozen-lockfile=false && pnpm build && pnpm test --run` (adjust to `pnpm exec vitest --run` if `pnpm test` isn't wired).
Expected: clean build, tests pass. If they don't, stop and fix baseline first.

- [ ] **Step 3: Verify ANTHROPIC_API_KEY is available**

Run: `grep -c ANTHROPIC .env.local 2>/dev/null || echo "MISSING"`
If `MISSING`: ask the user to provide the key. Don't proceed to Phase 2 until it's present in `.env.local`.

---

## Phase 1 — Foundation docs & glossary

### Task 1.1: Initial glossary

**Files:**
- Create: `config/i18n/glossary.yaml`

- [ ] **Step 1: Author initial glossary**

Write `config/i18n/glossary.yaml`:

```yaml
meta:
  version: 1
  locales: [en, de, es, ar]
  last_review: "2026-04-22"

brand:
  - id: reebal_sami
    category: transliterated
    forms:
      en: "Reebal Sami"
      de: "Reebal Sami"
      es: "Reebal Sami"
      ar: "رئبال سامي"
  - id: otto_group
    category: locked_source
    forms: { all: "OTTO Group" }
  - id: datalogue
    category: locked_source
    forms: { all: "Datalogue" }
  - id: fh_wedel
    category: locked_source
    forms: { all: "FH Wedel" }

tech:
  - id: react
    category: locked_source
    forms: { all: "React" }
  - id: nextjs
    category: locked_source
    forms: { all: "Next.js" }
  - id: postgres
    category: locked_source
    forms: { all: "PostgreSQL" }
  - id: llm
    category: locked_source
    forms: { all: "LLM" }
  - id: graphrag
    category: locked_source
    forms: { all: "GraphRAG" }
  - id: machine_learning
    category: translated
    forms:
      en: "machine learning"
      de: "maschinelles Lernen"
      es: "aprendizaje automático"
      ar: "التعلم الآلي"

titles:
  - id: data_scientist
    category: translated
    forms:
      en: "Data Scientist"
      de: "Data Scientist"
      es: "Científico de Datos"
      ar: "عالم البيانات"
  - id: ai_engineer
    category: translated
    forms:
      en: "AI Engineer"
      de: "KI-Ingenieur"
      es: "Ingeniero de IA"
      ar: "مهندس ذكاء اصطناعي"

cities:
  - id: hamburg
    category: transliterated
    forms:
      en: "Hamburg"
      de: "Hamburg"
      es: "Hamburgo"
      ar: "هامبورغ"

standards:
  - id: ifrs
    category: locked_source
    forms: { all: "IFRS" }
  - id: hgb
    category: locked_source
    forms: { all: "HGB" }
  - id: sap_fico
    category: locked_source
    forms: { all: "SAP FI-CO" }
```

- [ ] **Step 2: Commit**

```bash
git add config/i18n/glossary.yaml
git commit -m "feat(i18n): add initial glossary of locked terms across 4 locales"
```

### Task 1.2: Tone matrix document

**Files:** Create `docs/transcreation/tone-matrix.md`

- [ ] **Step 1: Copy the matrix from the tone-routing skill**

Content source: the matrix table in `.claude/skills/tone-routing/SKILL.md` sections "The matrix" through "Application rules". Write a self-contained `docs/transcreation/tone-matrix.md` that mirrors that content (don't just link — docs should survive skill refactors).

- [ ] **Step 2: Commit**

```bash
git add docs/transcreation/tone-matrix.md
git commit -m "docs(transcreation): section x locale tone matrix"
```

### Task 1.3: Persona — Arabic (Gulf)

**Files:** Create `docs/transcreation/personas/ar.md`

- [ ] **Step 1: Author the persona**

Write `docs/transcreation/personas/ar.md` with these sections: `voice_summary`, `vocabulary_bias` (list of preferred + avoided terms), `sentence_shapes` (typical constructions), `forbidden` (Classical flourishes, dialect markers, calques), `example_paragraphs` (3 short paragraphs showing the voice on: a hero tagline, an about paragraph, a contact message).

Source the direction from the tone-routing matrix AR column and the brand voice memory. Each example paragraph MUST exist in both the intended native form AND a gloss explanation (what makes it feel native).

- [ ] **Step 2: Commit**

```bash
git add docs/transcreation/personas/ar.md
git commit -m "docs(transcreation): Arabic (Gulf, modern-friendly) persona"
```

### Task 1.4: Persona — Spanish (Spain + Andalusian warmth)

**Files:** Create `docs/transcreation/personas/es.md`

- [ ] **Step 1: Author the persona**

Same structure as AR persona. Show 3 example paragraphs in Spain-standard Spanish with selective Andalusian warmth, `tú` form throughout. Explicitly mark vocabulary to avoid (LATAM-only tech words, overly formal Castilian set phrases).

- [ ] **Step 2: Commit**

```bash
git add docs/transcreation/personas/es.md
git commit -m "docs(transcreation): Spanish (Spain-standard + Andalusian warmth) persona"
```

### Task 1.5: Persona — German (modern Du)

**Files:** Create `docs/transcreation/personas/de.md`

- [ ] **Step 1: Author the persona**

Same structure. Brand voice direction: capitalized Du/Dir/Dich, never Sie. Short sentences, tech-confident vocabulary, no Anglicisms where clean German exists (unless a framework/product name). 3 example paragraphs: hero, about, contact.

- [ ] **Step 2: Commit**

```bash
git add docs/transcreation/personas/de.md
git commit -m "docs(transcreation): German (modern Du-form) persona"
```

### Task 1.6: Ghost-writing per-locale overrides

**Files:** Create `docs/transcreation/ghost-writing-locales.md`

- [ ] **Step 1: Author the overrides document**

Read `.windsurf/rules/ghost-writing.md` first (it's gitignored but accessible). Write `docs/transcreation/ghost-writing-locales.md` that:
1. References the English rule as the default.
2. For each of AR, ES, DE: lists which English-rule constraints DO apply verbatim and which DON'T (with justification).
3. Example: AR Gulf business context may use a respectful soft opener (e.g., "يسعدني مشاركتك...") that the EN rule forbids as a "friendly closer." Override: allowed in AR Contact, About, and Blog sections; still forbidden in Projects and CV.

- [ ] **Step 2: Commit**

```bash
git add docs/transcreation/ghost-writing-locales.md
git commit -m "docs(transcreation): per-locale overrides for ghost-writing rule"
```

---

## Phase 2 — Anthropic SDK + generation script

### Task 2.1: Add Anthropic SDK dependency

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `.env.example`

- [ ] **Step 1: Install the SDK**

Run: `pnpm add @anthropic-ai/sdk`
Expected: `package.json` dependencies gains `@anthropic-ai/sdk: ^X.Y.Z`, lockfile updates.

- [ ] **Step 2: Add env var to example**

Edit `.env.example` — add after the `CHATBOT_API_KEY` block:

```
# --- Transcreation (Anthropic Claude Opus 4.7 — dev-time scripts only) ---
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here
```

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml .env.example
git commit -m "chore(deps): add @anthropic-ai/sdk for dev-time transcreation"
```

### Task 2.2: Glossary loader with Zod schema (TDD)

**Files:**
- Create: `src/lib/i18n/glossary.ts`
- Create: `tests/unit/glossary.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/unit/glossary.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { loadGlossary, formFor } from "@/lib/i18n/glossary";

describe("glossary", () => {
  const g = loadGlossary();

  it("loads and parses glossary.yaml", () => {
    expect(g.meta.version).toBe(1);
    expect(g.meta.locales).toEqual(["en", "de", "es", "ar"]);
  });

  it("resolves locked_source to same form for all locales", () => {
    expect(formFor(g, "otto_group", "ar")).toBe("OTTO Group");
    expect(formFor(g, "otto_group", "de")).toBe("OTTO Group");
  });

  it("resolves translated term per locale", () => {
    expect(formFor(g, "data_scientist", "ar")).toBe("عالم البيانات");
    expect(formFor(g, "data_scientist", "es")).toBe("Científico de Datos");
  });

  it("throws on unknown id", () => {
    expect(() => formFor(g, "nonexistent_id", "en")).toThrow();
  });
});
```

- [ ] **Step 2: Run test to confirm failure**

Run: `pnpm exec vitest --run tests/unit/glossary.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement loader**

Create `src/lib/i18n/glossary.ts`:

```typescript
import fs from "node:fs";
import path from "node:path";
import yaml from "yaml";
import { z } from "zod/v4";

const FormsSchema = z.union([
  z.object({ all: z.string() }),
  z.record(z.enum(["en", "de", "es", "ar"]), z.string()),
]);

const EntrySchema = z.object({
  id: z.string(),
  category: z.enum(["locked_source", "transliterated", "translated", "per_context"]),
  forms: FormsSchema,
  notes: z.record(z.string(), z.string()).optional(),
});

const GlossarySchema = z.object({
  meta: z.object({
    version: z.number(),
    locales: z.array(z.string()),
    last_review: z.string(),
  }),
}).catchall(z.array(EntrySchema));

export type Glossary = z.infer<typeof GlossarySchema>;
export type Locale = "en" | "de" | "es" | "ar";

export function loadGlossary(filePath?: string): Glossary {
  const p = filePath ?? path.resolve(process.cwd(), "config/i18n/glossary.yaml");
  const raw = fs.readFileSync(p, "utf-8");
  return GlossarySchema.parse(yaml.parse(raw));
}

export function formFor(g: Glossary, id: string, locale: Locale): string {
  for (const key of Object.keys(g)) {
    if (key === "meta") continue;
    const entries = g[key as keyof Glossary] as unknown as Array<z.infer<typeof EntrySchema>>;
    const found = entries.find((e) => e.id === id);
    if (!found) continue;
    if ("all" in found.forms) return found.forms.all;
    const form = found.forms[locale];
    if (!form) throw new Error(`Glossary: no form for id=${id} locale=${locale}`);
    return form;
  }
  throw new Error(`Glossary: unknown id "${id}"`);
}
```

- [ ] **Step 4: Run test to confirm pass**

Run: `pnpm exec vitest --run tests/unit/glossary.test.ts`
Expected: all 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/i18n/glossary.ts tests/unit/glossary.test.ts
git commit -m "feat(i18n): glossary loader with Zod schema and per-locale resolution"
```

### Task 2.3: Transcreation prompt builder (TDD)

**Files:**
- Create: `src/lib/i18n/transcreation-prompt.ts`
- Create: `tests/unit/transcreation-prompt.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/unit/transcreation-prompt.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { buildTranscreationPrompt } from "@/lib/i18n/transcreation-prompt";

describe("buildTranscreationPrompt", () => {
  it("includes locale, section, glossary excerpt, and persona", () => {
    const prompt = buildTranscreationPrompt({
      locale: "ar",
      section: "hero",
      sourceText: "Merging five years of engineering and business.",
      glossaryExcerpt: "- data_scientist: عالم البيانات\n- hamburg: هامبورغ",
      personaMd: "Arabic Gulf persona summary...",
      toneCell: "Confident, metric-forward. MSA. Short sentences.",
    });
    expect(prompt).toContain("ar");
    expect(prompt).toContain("hero");
    expect(prompt).toContain("عالم البيانات");
    expect(prompt).toContain("Confident, metric-forward");
    expect(prompt).toContain("Merging five years");
  });

  it("forbids paraphrasing locked glossary terms", () => {
    const prompt = buildTranscreationPrompt({
      locale: "es",
      section: "cv",
      sourceText: "Works at OTTO Group.",
      glossaryExcerpt: "- otto_group: OTTO Group (locked in all locales)",
      personaMd: "ES persona...",
      toneCell: "European Spanish, professional.",
    });
    expect(prompt).toMatch(/glossary|locked|verbatim/i);
  });
});
```

- [ ] **Step 2: Confirm failure**

Run: `pnpm exec vitest --run tests/unit/transcreation-prompt.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement**

Create `src/lib/i18n/transcreation-prompt.ts`:

```typescript
export interface TranscreationPromptInput {
  locale: "de" | "es" | "ar";
  section: "hero" | "about" | "projects" | "blog" | "contact" | "cv" | "chatbot";
  sourceText: string;
  glossaryExcerpt: string;
  personaMd: string;
  toneCell: string;
}

export function buildTranscreationPrompt(input: TranscreationPromptInput): string {
  const { locale, section, sourceText, glossaryExcerpt, personaMd, toneCell } = input;
  return `You are transcreating content from English into ${locale.toUpperCase()} for the ${section} section of a professional portfolio.

## Brand voice (uniform across all locales)
modern, uncomplicated, friendly, competent.

## Persona for ${locale.toUpperCase()}
${personaMd}

## Tone cell for section=${section}, locale=${locale}
${toneCell}

## Glossary (these terms are LOCKED — render verbatim in the target-locale form, do not paraphrase)
${glossaryExcerpt}

## Rules
1. Preserve every numeric claim, date, proper noun, and metric from the source.
2. Preserve locked glossary terms verbatim.
3. Rewrite framing, verbs, connectives, and sentence structure so the text reads as native-authored in ${locale.toUpperCase()}.
4. Respect the tone cell above — do not import register from a different section.
5. Do not add new claims not present in the source.
6. Return ONLY the transcreated text — no preamble, no explanation.

## Source text
${sourceText}`;
}
```

- [ ] **Step 4: Confirm pass**

Run: `pnpm exec vitest --run tests/unit/transcreation-prompt.test.ts`

- [ ] **Step 5: Commit**

```bash
git add src/lib/i18n/transcreation-prompt.ts tests/unit/transcreation-prompt.test.ts
git commit -m "feat(i18n): transcreation-prompt builder with glossary + persona + tone inputs"
```

### Task 2.4: Transcreate CLI (scripts/transcreate.ts)

**Files:**
- Create: `scripts/transcreate.ts`
- Modify: `package.json` (add script)

- [ ] **Step 1: Write CLI**

Create `scripts/transcreate.ts`:

```typescript
#!/usr/bin/env tsx
import fs from "node:fs";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { loadGlossary, type Locale } from "../src/lib/i18n/glossary";
import { buildTranscreationPrompt } from "../src/lib/i18n/transcreation-prompt";

const [, , localeArg, sectionArg, inputPath] = process.argv;
if (!localeArg || !sectionArg || !inputPath) {
  console.error("Usage: tsx scripts/transcreate.ts <locale> <section> <input-file>");
  process.exit(1);
}
const locale = localeArg as Locale;
const section = sectionArg;
const sourceText = fs.readFileSync(inputPath, "utf-8");

const g = loadGlossary();
const glossaryExcerpt = Object.entries(g)
  .filter(([k]) => k !== "meta")
  .flatMap(([, arr]) => (arr as Array<{ id: string; forms: Record<string, string> }>))
  .map((e) => `- ${e.id}: ${("all" in e.forms ? e.forms.all : e.forms[locale]) ?? "—"}`)
  .join("\n");

const personaPath = path.resolve(`docs/transcreation/personas/${locale}.md`);
const personaMd = fs.readFileSync(personaPath, "utf-8");

const toneMatrixPath = path.resolve("docs/transcreation/tone-matrix.md");
const toneMatrix = fs.readFileSync(toneMatrixPath, "utf-8");
const toneCell = `See docs/transcreation/tone-matrix.md row=${section}, column=${locale}. Full matrix:\n\n${toneMatrix}`;

const prompt = buildTranscreationPrompt({
  locale: locale as "de" | "es" | "ar",
  section: section as "hero" | "about" | "projects" | "blog" | "contact" | "cv" | "chatbot",
  sourceText,
  glossaryExcerpt,
  personaMd,
  toneCell,
});

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const msg = await client.messages.create({
  model: "claude-opus-4-7",
  max_tokens: 4000,
  messages: [{ role: "user", content: prompt }],
});

const textBlock = msg.content.find((b) => b.type === "text");
if (!textBlock || textBlock.type !== "text") throw new Error("No text response");
process.stdout.write(textBlock.text);
```

- [ ] **Step 2: Add script alias**

Edit `package.json` scripts:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "transcreate": "tsx scripts/transcreate.ts"
}
```

Also add `tsx` to devDependencies if not present: `pnpm add -D tsx`.

- [ ] **Step 3: Smoke-test**

Create a small test source file:

```bash
echo "I am a Data Scientist from Hamburg." > /tmp/smoke.txt
pnpm transcreate ar hero /tmp/smoke.txt
```

Expected: Arabic output using `عالم البيانات` and `هامبورغ` from the glossary, in MSA hero register. Save for comparison — don't commit the smoke output.

- [ ] **Step 4: Commit**

```bash
git add scripts/transcreate.ts package.json pnpm-lock.yaml
git commit -m "feat(i18n): transcreate CLI using Claude Opus 4.7"
```

---

## Phase 3 — Chatbot locale wiring (TDD)

### Task 3.1: Transmit locale from frontend to API

**Files:**
- Modify: `src/components/chat/chat-widget.tsx`
- Create: `tests/unit/chat-widget-locale.test.tsx`

- [ ] **Step 1: Write failing test**

Create `tests/unit/chat-widget-locale.test.tsx`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { ChatWidget } from "@/components/chat/chat-widget";

const MESSAGES = { chatbot: { toggle: "Toggle", title: "Chat", subtitle: "Ask", welcome: "Hi", disclaimer: "D", error: "E", rateLimit: "R" } };

describe("ChatWidget locale transmission", () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue(new Response("", { status: 200 }));
  });

  it("sends locale in POST body when user sends message", async () => {
    render(
      <NextIntlClientProvider locale="ar" messages={MESSAGES}>
        <ChatWidget />
      </NextIntlClientProvider>
    );
    fireEvent.click(screen.getByLabelText(/toggle/i));
    // simulate send (project-specific: adapt to how ChatInput onSend is triggered)
    // The key assertion:
    const call = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    // If no call yet, this test skeleton needs the send-trigger adapted.
    // After send:
    // const body = JSON.parse(call[1].body);
    // expect(body.locale).toBe("ar");
  });
});
```

Note: this test is a skeleton — flesh out the send trigger based on ChatInput's implementation. The critical assertion is `body.locale === "ar"`.

- [ ] **Step 2: Confirm failure**

Run: `pnpm exec vitest --run tests/unit/chat-widget-locale.test.tsx`
Expected: FAIL — locale is not sent.

- [ ] **Step 3: Implement frontend change**

Edit `src/components/chat/chat-widget.tsx`:

Add `import { useLocale } from "next-intl";` at the top with the other next-intl import.

Add `const locale = useLocale();` near `const t = useTranslations("chatbot");`.

Modify the fetch body at line ~66 from:

```typescript
body: JSON.stringify({
  messages: [...messages, userMsg].map(...),
}),
```

to:

```typescript
body: JSON.stringify({
  locale,
  messages: [...messages, userMsg].map((m) => ({
    role: m.role,
    content: m.content,
  })),
}),
```

- [ ] **Step 4: Confirm test pass**

Run: `pnpm exec vitest --run tests/unit/chat-widget-locale.test.tsx`

- [ ] **Step 5: Commit**

```bash
git add src/components/chat/chat-widget.tsx tests/unit/chat-widget-locale.test.tsx
git commit -m "feat(chat): transmit locale from ChatWidget to /api/chat"
```

### Task 3.2: Parse + validate locale in route.ts (TDD)

**Files:**
- Modify: `src/app/api/chat/route.ts`
- Create: `tests/unit/chat-route-locale.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/unit/chat-route-locale.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { validateLocale } from "@/app/api/chat/route-helpers";

describe("validateLocale", () => {
  it("accepts valid locales", () => {
    expect(validateLocale("en")).toBe("en");
    expect(validateLocale("de")).toBe("de");
    expect(validateLocale("es")).toBe("es");
    expect(validateLocale("ar")).toBe("ar");
  });
  it("falls back to en on invalid or missing", () => {
    expect(validateLocale("fr")).toBe("en");
    expect(validateLocale(undefined)).toBe("en");
    expect(validateLocale("")).toBe("en");
    expect(validateLocale(null)).toBe("en");
  });
});
```

- [ ] **Step 2: Confirm failure**

Run: `pnpm exec vitest --run tests/unit/chat-route-locale.test.ts`

- [ ] **Step 3: Implement helpers module**

Create `src/app/api/chat/route-helpers.ts`:

```typescript
export type Locale = "en" | "de" | "es" | "ar";
const VALID: ReadonlySet<Locale> = new Set(["en", "de", "es", "ar"]);

export function validateLocale(value: unknown): Locale {
  if (typeof value === "string" && VALID.has(value as Locale)) {
    return value as Locale;
  }
  return "en";
}
```

- [ ] **Step 4: Confirm test pass**

Run: `pnpm exec vitest --run tests/unit/chat-route-locale.test.ts`

- [ ] **Step 5: Commit**

```bash
git add src/app/api/chat/route-helpers.ts tests/unit/chat-route-locale.test.ts
git commit -m "feat(chat): locale validator with en fallback"
```

### Task 3.3: loadLocaleContext with fallback (TDD)

**Files:**
- Modify: `src/app/api/chat/route-helpers.ts`
- Extend: `tests/unit/chat-route-locale.test.ts`

- [ ] **Step 1: Add failing test**

Append to `tests/unit/chat-route-locale.test.ts`:

```typescript
import { loadLocaleContext } from "@/app/api/chat/route-helpers";
import fs from "node:fs";
import path from "node:path";

describe("loadLocaleContext", () => {
  const tmpDir = path.resolve("/tmp/chatbot-ctx-test");
  beforeEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    fs.mkdirSync(tmpDir, { recursive: true });
    fs.writeFileSync(path.join(tmpDir, "chatbot-context.md"), "EN content");
    fs.writeFileSync(path.join(tmpDir, "chatbot-context.ar.md"), "AR content");
  });
  it("loads locale-specific file when it exists", async () => {
    const c = await loadLocaleContext("ar", tmpDir);
    expect(c).toBe("AR content");
  });
  it("falls back to EN when locale file missing", async () => {
    const c = await loadLocaleContext("de", tmpDir);
    expect(c).toBe("EN content");
  });
});
```

- [ ] **Step 2: Confirm failure**

- [ ] **Step 3: Implement**

Append to `src/app/api/chat/route-helpers.ts`:

```typescript
import fs from "node:fs";
import path from "node:path";

export async function loadLocaleContext(
  locale: Locale,
  baseDir?: string
): Promise<string> {
  const dir = baseDir ?? path.resolve(process.cwd(), "src/content");
  const primary = path.join(dir, `chatbot-context.${locale}.md`);
  const fallback = path.join(dir, "chatbot-context.md");
  try {
    return await fs.promises.readFile(primary, "utf-8");
  } catch {
    return await fs.promises.readFile(fallback, "utf-8");
  }
}
```

- [ ] **Step 4: Confirm pass**

- [ ] **Step 5: Commit**

```bash
git add src/app/api/chat/route-helpers.ts tests/unit/chat-route-locale.test.ts
git commit -m "feat(chat): loadLocaleContext with fallback to EN"
```

### Task 3.4: buildSystemPrompt per-locale (TDD)

**Files:**
- Extend: `src/app/api/chat/route-helpers.ts`
- Extend: `tests/unit/chat-route-locale.test.ts`

- [ ] **Step 1: Add failing test**

Append:

```typescript
import { buildSystemPrompt } from "@/app/api/chat/route-helpers";

describe("buildSystemPrompt", () => {
  it("ar: uses MSA persona block and language handling", () => {
    const p = buildSystemPrompt("ar", "<context>bio</context>");
    expect(p).toContain("العربية");
    expect(p).toContain("<context>bio</context>");
    expect(p).not.toMatch(/respond in german|use sie/i);
  });
  it("de: uses Du-form persona block", () => {
    const p = buildSystemPrompt("de", "ctx");
    expect(p).toMatch(/\bDu\b/);
    expect(p).not.toMatch(/\bSie\b/);
  });
  it("es: uses tú-form persona block", () => {
    const p = buildSystemPrompt("es", "ctx");
    expect(p).toMatch(/\btú\b/);
  });
  it("en: uses English persona block", () => {
    const p = buildSystemPrompt("en", "ctx");
    expect(p).toContain("Reebal");
    expect(p).toMatch(/friendly|competent|modern/i);
  });
});
```

- [ ] **Step 2: Confirm failure**

- [ ] **Step 3: Implement per-locale persona blocks**

Append to `src/app/api/chat/route-helpers.ts`:

```typescript
const PERSONAS: Record<Locale, string> = {
  en: `You are Reebal's personal assistant. Your tone: modern, uncomplicated, friendly, competent. Speak in clear English with short sentences and concrete examples.`,
  de: `Du bist Reebals persönlicher Assistent. Dein Ton: modern, unkompliziert, freundlich, kompetent. Du sprichst Deutsch in der Du-Form mit großem D (Du, Dir, Dich). Keine Sie-Form, außer der Nutzer siezt Dich zuerst.`,
  es: `Eres el asistente personal de Reebal. Tu tono: moderno, directo, amigable, competente. Hablas en español de España con calidez andaluza. Usas tú, nunca usted (salvo que el usuario lo use primero).`,
  ar: `أنت مساعد رئبال الشخصي. نبرتك: عصرية، مباشرة، ودودة، متمكنة. تتحدث بالعربية الفصحى الحديثة بمفردات الأعمال الخليجية. لا تستخدم اللهجات. لا تستخدم الفصحى الكلاسيكية الأدبية.`,
};

const GROUNDING: Record<Locale, string> = {
  en: `Ground responses in the context. If not covered, say so and suggest contacting Reebal directly. Don't fabricate.`,
  de: `Stütze Antworten auf den Kontext. Wenn nicht abgedeckt, sag das und schlage vor, Reebal direkt zu kontaktieren. Keine Erfindungen.`,
  es: `Basa las respuestas en el contexto. Si no está cubierto, dilo y sugiere contactar con Reebal directamente. No inventes.`,
  ar: `استند في ردودك إلى السياق أدناه. إذا لم يغطِّ السياق السؤال، وضّح ذلك واقترح التواصل المباشر مع رئبال. لا تلفّق.`,
};

const LANGUAGE_RULE: Record<Locale, string> = {
  en: `Respond in the user's language. If they mix languages, respond primarily in EN.`,
  de: `Antworte in der Sprache des Nutzers. Bei Sprachmischung primär in Deutsch.`,
  es: `Responde en el idioma del usuario. Si mezcla idiomas, responde principalmente en español.`,
  ar: `أجب بلغة المستخدم. إذا خلط اللغات، فأجب أساساً بالعربية.`,
};

export function buildSystemPrompt(locale: Locale, context: string): string {
  return `${PERSONAS[locale]}

${GROUNDING[locale]}

${LANGUAGE_RULE[locale]}

${context}`;
}
```

- [ ] **Step 4: Confirm pass**

- [ ] **Step 5: Wire into route.ts**

Edit `src/app/api/chat/route.ts`:

Remove the module-level context load at lines 28–32 and the hardcoded systemPrompt at lines 37–65.

Replace with imports:

```typescript
import { validateLocale, loadLocaleContext, buildSystemPrompt } from "./route-helpers";
```

Inside `POST`, after body parsing (around line 99), add:

```typescript
const locale = validateLocale((body as { locale?: unknown }).locale);
const contextText = await loadLocaleContext(locale);
const systemPrompt = buildSystemPrompt(locale, `<context>\n${contextText}\n</context>`);
```

Use the dynamic `systemPrompt` in the `streamText` call.

- [ ] **Step 6: Run all tests**

Run: `pnpm exec vitest --run`
Expected: all pass, including the chat-widget-locale test.

- [ ] **Step 7: Commit**

```bash
git add src/app/api/chat/route.ts src/app/api/chat/route-helpers.ts tests/unit/chat-route-locale.test.ts
git commit -m "feat(chat): locale-routed system prompts with per-locale persona + grounding"
```

---

## Phase 4 — Per-locale chatbot context files

### Task 4.1: Arabic chatbot context

**Files:** Create `src/content/chatbot-context.ar.md`

- [ ] **Step 1: Generate**

Run: `pnpm transcreate ar chatbot src/content/chatbot-context.md > src/content/chatbot-context.ar.md`

- [ ] **Step 2: Audit**

Invoke the `transcreation-audit` skill with the generated file as input. Resolve any BLOCKER findings by editing the file directly.

- [ ] **Step 3: Add sync marker**

Prepend `<!-- last-synced: 2026-04-22 from chatbot-context.md -->` as the first line.

- [ ] **Step 4: Commit**

```bash
git add src/content/chatbot-context.ar.md
git commit -m "feat(chat): Arabic chatbot context (Gulf MSA, modern-friendly)"
```

### Task 4.2: Spanish chatbot context

**Files:** Create `src/content/chatbot-context.es.md`

- [ ] **Step 1**: `pnpm transcreate es chatbot src/content/chatbot-context.md > src/content/chatbot-context.es.md`
- [ ] **Step 2**: Audit + fix blockers.
- [ ] **Step 3**: Add sync marker.
- [ ] **Step 4**: Commit `feat(chat): Spanish chatbot context (Spain-standard, informal tú)`.

### Task 4.3: German chatbot context

**Files:** Create `src/content/chatbot-context.de.md`

- [ ] **Step 1**: `pnpm transcreate de chatbot src/content/chatbot-context.md > src/content/chatbot-context.de.md`
- [ ] **Step 2**: Audit + fix blockers. Verify Du-capitalization throughout.
- [ ] **Step 3**: Add sync marker.
- [ ] **Step 4**: Commit `feat(chat): German chatbot context (Du-form, modern-competent)`.

---

## Phase 5 — Messages rewrite (per locale, section by section)

Each task: for the one locale, regenerate each section key-group, review diff, fix issues, commit as one PR-worthy change. Do NOT commit partial locales.

### Task 5.1: Arabic messages

**Files:** Modify `src/messages/ar.json`

- [ ] **Step 1: For each of these section groups, generate a transcreation** using `pnpm transcreate ar <section> <temp-file>` where `<temp-file>` contains the EN JSON sub-tree serialized as plain lines with keys preserved:
  - `home.hero.*`
  - `home.about.*` + `about.*`
  - `projects.*`
  - `blog.*`
  - `contact.*`
  - `cv.*`
  - `chatbot.*`

- [ ] **Step 2: Integrate output into ar.json** preserving exact key structure from en.json. Do NOT add or remove keys.

- [ ] **Step 3: Run transcreation-audit** over the full ar.json. Resolve BLOCKER + MEDIUM findings.

- [ ] **Step 4: Verify key parity**

Run: `node -e "const en=require('./src/messages/en.json'),ar=require('./src/messages/ar.json'); function keys(o,p=''){return Object.entries(o).flatMap(([k,v])=>typeof v==='object'?keys(v,p+k+'.'):[p+k])} const e=keys(en).sort().join('\n'),a=keys(ar).sort().join('\n'); if(e!==a){console.error('KEY PARITY FAIL');process.exit(1)} console.log('OK')"`

Expected: `OK`.

- [ ] **Step 5: Commit**

```bash
git add src/messages/ar.json
git commit -m "feat(i18n): transcreation rewrite of Arabic messages (Gulf modern-friendly)"
```

### Task 5.2: Spanish messages

**Files:** Modify `src/messages/es.json`

- [ ] **Step 1**: For each of `home.hero.*`, `home.about.*` + `about.*`, `projects.*`, `blog.*`, `contact.*`, `cv.*`, `chatbot.*` — generate a transcreation via `pnpm transcreate es <section> <temp-file>` where `<temp-file>` holds the EN JSON sub-tree serialized line-by-line with keys preserved.

- [ ] **Step 2**: Integrate output into `src/messages/es.json` preserving the exact key structure from `en.json`. Do NOT add or remove keys.

- [ ] **Step 3**: Run the transcreation-audit skill over the full `es.json`. Resolve BLOCKER + MEDIUM findings.

- [ ] **Step 4**: Verify key parity

```bash
node -e "const en=require('./src/messages/en.json'),es=require('./src/messages/es.json'); function keys(o,p=''){return Object.entries(o).flatMap(([k,v])=>typeof v==='object'?keys(v,p+k+'.'):[p+k])} const e=keys(en).sort().join('\n'),s=keys(es).sort().join('\n'); if(e!==s){console.error('KEY PARITY FAIL');process.exit(1)} console.log('OK')"
```

- [ ] **Step 5**: Commit

```bash
git add src/messages/es.json
git commit -m "feat(i18n): transcreation rewrite of Spanish messages (Spain-standard + Andalusian warmth)"
```

### Task 5.3: German messages

**Files:** Modify `src/messages/de.json`

- [ ] **Step 1**: For each of `home.hero.*`, `home.about.*` + `about.*`, `projects.*`, `blog.*`, `contact.*`, `cv.*`, `chatbot.*` — generate a transcreation via `pnpm transcreate de <section> <temp-file>` where `<temp-file>` holds the EN JSON sub-tree serialized line-by-line with keys preserved.

- [ ] **Step 2**: Integrate output into `src/messages/de.json` preserving the exact key structure from `en.json`. Do NOT add or remove keys.

- [ ] **Step 3**: Run the transcreation-audit skill over the full `de.json`. Resolve BLOCKER + MEDIUM findings.

- [ ] **Step 4**: Verify key parity AND verify Du-form discipline

```bash
node -e "const en=require('./src/messages/en.json'),de=require('./src/messages/de.json'); function keys(o,p=''){return Object.entries(o).flatMap(([k,v])=>typeof v==='object'?keys(v,p+k+'.'):[p+k])} const e=keys(en).sort().join('\n'),d=keys(de).sort().join('\n'); if(e!==d){console.error('KEY PARITY FAIL');process.exit(1)} console.log('OK')"

# Formal address must be absent (Du-form only)
grep -E "\"[^\"]*\\\\bSie\\\\b[^\"]*\"|\"[^\"]*\\\\bIhr(e|em|en|er)?\\\\b[^\"]*\"|\"[^\"]*\\\\bIhnen\\\\b[^\"]*\"" src/messages/de.json && echo "FORMAL-ADDRESS FOUND" && exit 1
echo "Du-form OK"
```

Expected both: `OK` and `Du-form OK` (no output from the grep).

- [ ] **Step 5**: Commit

```bash
git add src/messages/de.json
git commit -m "feat(i18n): transcreation rewrite of German messages (Du-form, modern-competent)"
```

---

## Phase 6 — CV YAML rewrite (per locale, field by field)

Each task: regenerate the `<locale>` sub-fields of every multi-locale field in `config/cv/cv.public.yaml` (and `cv.full.yaml` if it contains public-facing content; private file is gitignored and skipped).

### Task 6.1: CV YAML — Arabic locale fields

**Files:** Modify `config/cv/cv.public.yaml`

- [ ] **Step 1: Enumerate all ar-valued fields**

Run: `grep -n "ar:" config/cv/cv.public.yaml | head -50`
Expected: list of lines with `ar:` keys (position, description, highlights, institution, etc.).

- [ ] **Step 2: For each field, regenerate**

For each ar-valued field, use `pnpm transcreate ar cv <tmp>` on the EN sibling. Replace the ar value with the output. Keep locked glossary terms verbatim (the prompt enforces this).

- [ ] **Step 3: Audit** via transcreation-audit skill.

- [ ] **Step 4: ATS verification**

Run: `pnpm exec playwright test tests/e2e/cv-ats.spec.ts` if it exists, OR manually verify via the CV preview at `/ar/cv` that job titles, company names, and tech terms extract recognizably.

- [ ] **Step 5: Commit**

```bash
git add config/cv/cv.public.yaml
git commit -m "feat(cv): transcreation rewrite of Arabic CV locale fields"
```

### Task 6.2: CV YAML — Spanish locale fields

**Files:** Modify `config/cv/cv.public.yaml`

- [ ] **Step 1**: `grep -n "es:" config/cv/cv.public.yaml | head -50` to enumerate all es-valued fields.
- [ ] **Step 2**: For each es-valued field, use `pnpm transcreate es cv <tmp>` on the EN sibling. Replace the es value with the output. Locked glossary terms stay verbatim (the prompt enforces this).
- [ ] **Step 3**: Audit via transcreation-audit skill.
- [ ] **Step 4**: Visit `/es/cv` locally; confirm job titles, company names, and tech terms extract recognizably (manual ATS sanity).
- [ ] **Step 5**: Commit

```bash
git add config/cv/cv.public.yaml
git commit -m "feat(cv): transcreation rewrite of Spanish CV locale fields"
```

### Task 6.3: CV YAML — German locale fields

**Files:** Modify `config/cv/cv.public.yaml`

- [ ] **Step 1**: `grep -n "de:" config/cv/cv.public.yaml | head -50` to enumerate all de-valued fields.
- [ ] **Step 2**: For each de-valued field, use `pnpm transcreate de cv <tmp>` on the EN sibling. Replace the de value with the output.
- [ ] **Step 3**: Audit via transcreation-audit skill.
- [ ] **Step 4**: Visit `/de/cv` locally; confirm first-person constructions use Du-form where direct address appears (often CVs use third-person, so Du may be rare in CV).
- [ ] **Step 5**: Commit

```bash
git add config/cv/cv.public.yaml
git commit -m "feat(cv): transcreation rewrite of German CV locale fields (Du-form where applicable)"
```

---

## Phase 7 — Pre-commit hooks

### Task 7.1: husky + pre-commit infrastructure

**Files:**
- Modify: `package.json`
- Create: `.husky/pre-commit`

- [ ] **Step 1: Install husky**

```bash
pnpm add -D husky
pnpm exec husky init
```

This creates `.husky/pre-commit`.

- [ ] **Step 2: Edit `.husky/pre-commit`**

```bash
#!/usr/bin/env sh
pnpm exec tsx scripts/check-locale-parity.ts
pnpm exec tsx scripts/check-glossary-drift.ts
```

- [ ] **Step 3: Commit**

```bash
git add .husky/pre-commit package.json pnpm-lock.yaml
git commit -m "chore(tooling): husky pre-commit scaffold"
```

### Task 7.2: check-locale-parity script (TDD)

**Files:**
- Create: `scripts/check-locale-parity.ts`
- Create: `tests/unit/check-locale-parity.test.ts`

- [ ] **Step 1: Write failing test** — verify the function returns a diff when locale files have different keys, empty when identical.

- [ ] **Step 2: Implement** — loads `src/messages/en.json` as source, loads each of `ar.json`/`es.json`/`de.json`, compares flattened key sets, prints missing + extra keys per locale, exits non-zero if any diff.

- [ ] **Step 3: Test manually**

```bash
pnpm exec tsx scripts/check-locale-parity.ts
```

Expected: exit 0, prints "OK - all locales in key parity with en.json".

- [ ] **Step 4: Commit**

```bash
git add scripts/check-locale-parity.ts tests/unit/check-locale-parity.test.ts
git commit -m "feat(tooling): pre-commit check for locale message key parity"
```

### Task 7.3: check-glossary-drift script (TDD)

**Files:**
- Create: `scripts/check-glossary-drift.ts`
- Create: `tests/unit/check-glossary-drift.test.ts`

- [ ] **Step 1: Write failing test** — given a glossary with an AR entry `عالم البيانات` and a fixture ar.json containing `"Data Scientist"` (wrong form), function should report drift.

- [ ] **Step 2: Implement** — for each locked glossary entry, for each locale file (`src/messages/*.json` + `config/cv/*.yaml`), verify the locale-specific form appears (if the term is referenced at all) AND that no OTHER locale's form leaks in.

  Be conservative: only flag drift when the OTHER-locale form is unambiguous (e.g., Arabic text in a Spanish file). Don't false-positive on English tech terms inside Spanish/German text — English is allowed as a code-switched form for tech.

- [ ] **Step 3: Test manually** after Phases 4/5/6 content is in place.

- [ ] **Step 4: Commit**

```bash
git add scripts/check-glossary-drift.ts tests/unit/check-glossary-drift.test.ts
git commit -m "feat(tooling): pre-commit check for glossary term drift across locales"
```

---

## Phase 8 — RTL visual smoke tests (Arabic)

### Task 8.1: Chrome DevTools MCP RTL smoke test

**Files:** none (runtime test)

- [ ] **Step 1: Start dev server**

Run: `pnpm dev` in background.

- [ ] **Step 2: For each of Hero, About, Projects, Contact, CV sections** — use the chrome-devtools MCP to navigate to `/ar`, take a screenshot, and verify:
  - Text direction is RTL (inspect `html[dir="rtl"]`).
  - Latin-script tech terms (e.g., "React", "GraphRAG") render in their original direction embedded in the RTL flow (no reversal).
  - Numbers render consistently (Western digits, since glossary spec chose `locked_source` for `%`).
  - Section layout is mirrored appropriately (e.g., hero image on the left in EN becomes on the right in AR).

- [ ] **Step 3: Save baseline screenshots** to `tests/e2e/rtl-baseline/{section}-ar.png`. These become regression anchors.

- [ ] **Step 4: Add a Playwright regression test**

Create `tests/e2e/rtl-regression.spec.ts` that navigates to `/ar` for each section and compares against the baseline screenshot. Tolerance: 1% pixel diff.

- [ ] **Step 5: Commit**

```bash
git add tests/e2e/rtl-baseline/ tests/e2e/rtl-regression.spec.ts
git commit -m "test(rtl): Arabic visual regression baseline across sections"
```

---

## Phase 9 — Final audit + ship

### Task 9.1: Cross-locale audit pass

**Files:** none (review)

- [ ] **Step 1: Run transcreation-audit skill** across all three locales end-to-end.

- [ ] **Step 2: Resolve any remaining BLOCKER findings** via targeted commits.

- [ ] **Step 3: Confirm the pre-commit hooks pass** on a representative change.

### Task 9.2: PR creation

- [ ] **Step 1: Push branch**

```bash
git push -u origin feat/transcreation-system
```

- [ ] **Step 2: Create PR**

```bash
gh pr create --title "feat(i18n): section-aware transcreation system for AR/ES/DE + chatbot localization" --body "$(cat <<'EOF'
## Summary
- Adds locked-term glossary, per-locale persona docs, tone matrix
- Claude Opus 4.7-powered transcreation CLI for dev-time content generation
- Locale-routed chatbot: AR/ES/DE/EN personas, per-locale context files, locale transmission frontend→API
- Full transcreation rewrite of ar.json, es.json, de.json messages
- Full transcreation rewrite of CV YAML locale fields for AR/ES/DE
- Pre-commit hooks: locale key parity + glossary drift detection
- RTL visual regression baseline for Arabic

## Test plan
- [ ] `pnpm test --run` — all unit tests pass
- [ ] `pnpm exec playwright test tests/e2e/rtl-regression.spec.ts` — no regressions
- [ ] Manually hit `/ar`, `/es`, `/de` — hero/about/projects/cv/contact all read native
- [ ] Manually hit chatbot in each locale — responds in correct language, register, scope

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

