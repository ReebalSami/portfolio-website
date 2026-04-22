#!/usr/bin/env tsx
import fs from "node:fs";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { loadGlossary, type Locale } from "../src/lib/i18n/glossary";
import {
  buildTranscreationPrompt,
  type TranscreationSection,
} from "../src/lib/i18n/transcreation-prompt";

const [, , localeArg, sectionArg, inputPath] = process.argv;

if (!localeArg || !sectionArg || !inputPath) {
  console.error("Usage: pnpm transcreate <locale> <section> <input-file>");
  console.error("  locale: ar | es | de");
  console.error(
    "  section: hero | about | projects | blog | contact | cv | chatbot",
  );
  process.exit(1);
}

const validLocales: Locale[] = ["ar", "es", "de"];
const validSections: TranscreationSection[] = [
  "hero",
  "about",
  "projects",
  "blog",
  "contact",
  "cv",
  "chatbot",
];

if (!validLocales.includes(localeArg as Locale)) {
  console.error(
    `Invalid locale: ${localeArg}. Valid: ${validLocales.join(", ")}`,
  );
  process.exit(1);
}
if (!validSections.includes(sectionArg as TranscreationSection)) {
  console.error(
    `Invalid section: ${sectionArg}. Valid: ${validSections.join(", ")}`,
  );
  process.exit(1);
}

const locale = localeArg as Locale;
const section = sectionArg as TranscreationSection;
const sourceText = fs.readFileSync(inputPath, "utf-8");

const g = loadGlossary();
const glossaryLines: string[] = [];
for (const key of Object.keys(g)) {
  if (key === "meta") continue;
  const entries = (g as Record<string, unknown>)[key];
  if (!Array.isArray(entries)) continue;
  for (const e of entries) {
    const displayForm =
      locale === "en"
        ? (e.forms?.all ?? e.forms?.en ?? "")
        : (e.forms?.all ?? e.forms?.[locale] ?? "");
    glossaryLines.push(`- ${e.id}: ${displayForm}`);
  }
}
const glossaryExcerpt = glossaryLines.join("\n");

const personaPath = path.resolve(
  process.cwd(),
  `docs/transcreation/personas/${locale}.md`,
);
const personaMd = fs.readFileSync(personaPath, "utf-8");

const toneMatrixPath = path.resolve(
  process.cwd(),
  "docs/transcreation/tone-matrix.md",
);
const toneMatrix = fs.readFileSync(toneMatrixPath, "utf-8");
const toneCell = `Refer to the matrix below and apply the row for section="${section}" and locale="${locale}".\n\n${toneMatrix}`;

const prompt = buildTranscreationPrompt({
  locale: locale as "de" | "es" | "ar",
  section,
  sourceText,
  glossaryExcerpt,
  personaMd,
  toneCell,
});

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error("ANTHROPIC_API_KEY is not set. Add it to .env.local.");
  process.exit(1);
}

const client = new Anthropic({ apiKey });

(async () => {
  const msg = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 4000,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = msg.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    console.error("No text response from Anthropic API");
    process.exit(1);
  }

  process.stdout.write(textBlock.text);
})();
