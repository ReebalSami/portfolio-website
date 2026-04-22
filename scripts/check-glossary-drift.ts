import fs from "node:fs";
import path from "node:path";
import yaml from "yaml";

type Locale = "en" | "de" | "es" | "ar";
type Forms = { all: string } | Partial<Record<Locale, string>>;
interface GlossaryEntry {
  id: string;
  category: "locked_source" | "transliterated" | "translated";
  forms: Forms;
  skip_drift_check?: boolean;
}

export function detectDrift(
  entry: GlossaryEntry,
  targetLocale: Locale,
  content: string
): string[] {
  // locked_source: same in all locales, no drift possible
  if (entry.category === "locked_source") return [];

  // Entries with intentional code-switching (e.g. certification names, widely-used tech terms)
  if (entry.skip_drift_check) return [];

  const forms = entry.forms as Partial<Record<Locale, string>>;
  const correctForm = forms[targetLocale];
  if (!correctForm) return []; // No expected form for this locale, skip

  const issues: string[] = [];

  // Check if any OTHER locale's form (that differs from correct form) appears in content
  for (const [locale, form] of Object.entries(forms) as [Locale, string][]) {
    if (locale === targetLocale) continue;
    if (!form || form === correctForm) continue; // Same form in multiple locales — not a drift signal
    // Conservative: only flag when the wrong form is unambiguously wrong
    // For transliterated entries, skip cross-locale detection (forms may share script)
    if (entry.category === "transliterated") continue;
    // For translated entries: flag if a distinctly-other-locale form appears in target content
    if (content.includes(form)) {
      issues.push(`entry "${entry.id}": found ${locale}-form "${form}" in ${targetLocale} content`);
    }
  }
  return issues;
}

const isMain =
  process.argv[1]?.endsWith("check-glossary-drift.ts") ||
  process.argv[1]?.endsWith("check-glossary-drift.js");

if (isMain) {
  const glossaryPath = path.resolve(process.cwd(), "config/i18n/glossary.yaml");
  const glossaryRaw = yaml.parse(fs.readFileSync(glossaryPath, "utf-8"));
  const messagesDir = path.resolve(process.cwd(), "src/messages");
  const locales: Locale[] = ["ar", "de", "es"];

  const allEntries: GlossaryEntry[] = [];
  for (const [key, val] of Object.entries(glossaryRaw)) {
    if (key === "meta" || !Array.isArray(val)) continue;
    allEntries.push(...(val as GlossaryEntry[]));
  }

  // Note: config/cv/*.yaml is intentionally NOT included here because it is a
  // multilingual YAML (all locale forms coexist in one file), which causes
  // false positives when scanning for cross-locale term leakage.
  // CV YAML glossary compliance should be verified via `make cv:verify` or
  // a dedicated YAML-aware validator that extracts each locale's fields separately.
  let hasError = false;
  for (const locale of locales) {
    const content = fs.readFileSync(path.join(messagesDir, `${locale}.json`), "utf-8");
    for (const entry of allEntries) {
      const issues = detectDrift(entry, locale, content);
      if (issues.length > 0) {
        issues.forEach((i) => console.error(`[glossary-drift] ${i}`));
        hasError = true;
      }
    }
  }

  if (hasError) process.exit(1);
  console.log("[glossary-drift] OK — no glossary drift detected in locale files");
}
