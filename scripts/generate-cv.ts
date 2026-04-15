/**
 * CV PDF Generator — Unified Typst Pipeline
 *
 * Compiles both ATS (single-column) and Visual (two-column) CVs via Typst.
 * Runs ATS text extraction verification on the ATS variant.
 *
 * Usage:
 *   pnpm tsx scripts/generate-cv.ts                   # both variants
 *   pnpm tsx scripts/generate-cv.ts --variant ats     # ATS only
 *   pnpm tsx scripts/generate-cv.ts --variant visual  # Visual only
 *   pnpm tsx scripts/generate-cv.ts --verify          # verify ATS PDF only
 *   pnpm tsx scripts/generate-cv.ts --locale en       # single locale
 */

import { execSync } from "node:child_process";
import path from "node:path";
import fs from "node:fs";

const ROOT = path.resolve(new URL(".", import.meta.url).pathname, "..");
const FONT_PATH = path.join(ROOT, "scripts/typst/fonts");
const OUTPUT_FILE = "resume_reebal_sami.pdf";
const LOCALES = ["en"]; // Add "de", "es", "ar" when translations are complete

interface Variant {
  id: string;
  template: string;
  outputDir: string;
  verify: boolean;
}

const VARIANTS: Variant[] = [
  {
    id: "ats",
    template: path.join(ROOT, "scripts/typst/ats/cv-ats.typ"),
    outputDir: path.join(ROOT, "public/cv/ats"),
    verify: true,
  },
  {
    id: "visual",
    template: path.join(ROOT, "scripts/typst/visual/cv-visual.typ"),
    outputDir: path.join(ROOT, "public/cv/visual"),
    verify: false,
  },
];

const EXPECTED_SECTIONS = [
  "Reebal Sami",
  "PROFILE",
  "EXPERIENCE",
  "EDUCATION",
];

// --- Parse CLI args ---
const args = process.argv.slice(2);
const verifyOnly = args.includes("--verify");
const variantArg = args.find((_, i, a) => a[i - 1] === "--variant");
const localeArg = args.find((_, i, a) => a[i - 1] === "--locale");
const locales = localeArg ? [localeArg] : LOCALES;
const selectedVariants = variantArg
  ? VARIANTS.filter((v) => v.id === variantArg)
  : VARIANTS;

if (variantArg && selectedVariants.length === 0) {
  console.error(`Unknown variant: ${variantArg}. Use "ats" or "visual".`);
  process.exit(1);
}

function compile(variant: Variant, locale: string): string {
  const outPath = path.join(variant.outputDir, OUTPUT_FILE);
  fs.mkdirSync(variant.outputDir, { recursive: true });
  const shapeSeed = Math.floor(Math.random() * 1_000_000) + 1;

  console.log(`\n  [${variant.id}] Compiling for locale: ${locale}`);
  const cmd = `typst compile --root "${ROOT}" --font-path "${FONT_PATH}" "${variant.template}" "${outPath}" --input locale=${locale} --input shapeSeed=${shapeSeed}`;

  try {
    execSync(cmd, { stdio: "pipe", encoding: "utf-8" });
    const stat = fs.statSync(outPath);
    console.log(
      `  [${variant.id}] Output: ${outPath} (${(stat.size / 1024).toFixed(0)} KB)`,
    );
    return outPath;
  } catch (err: unknown) {
    const e = err as { stderr?: string };
    console.error(`  [${variant.id}] FAILED: ${e.stderr || err}`);
    process.exit(1);
  }
}

function verifyAts(pdfPath: string): boolean {
  console.log(`\n  Verifying ATS text extraction...`);

  let text: string;
  try {
    text = execSync(`pdftotext "${pdfPath}" -`, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
  } catch {
    console.error("  pdftotext not found. Install with: brew install poppler");
    return false;
  }

  const lines = text.split("\n");
  let allPassed = true;

  // Check 1: Name in first 3 lines
  const nameInTop = lines.slice(0, 3).some((l) => l.includes("Reebal Sami"));
  log("Name in first 3 lines", nameInTop);
  if (!nameInTop) allPassed = false;

  // Check 2: Email in first 8 lines
  const emailInTop = lines.slice(0, 8).some((l) => l.includes("contact@"));
  log("Email in first 8 lines", emailInTop);
  if (!emailInTop) allPassed = false;

  // Check 3: No mailto: or https:// prefixes
  const noMailto = !text.includes("mailto:");
  const noHttps = !text.includes("https://");
  log("No mailto: prefix", noMailto);
  log("No https:// prefix", noHttps);
  if (!noMailto || !noHttps) allPassed = false;

  // Check 4: All expected sections present
  for (const section of EXPECTED_SECTIONS) {
    const found = text.includes(section);
    log(`Section "${section}" present`, found);
    if (!found) allPassed = false;
  }

  // Check 5: Key skills present
  const keySkills = ["Python", "TypeScript", "PyTorch", "AWS", "Docker", "React"];
  const missingSkills = keySkills.filter((s) => !text.includes(s));
  const skillsOk = missingSkills.length === 0;
  log(
    "Key skills present",
    skillsOk,
    skillsOk ? undefined : `Missing: ${missingSkills.join(", ")}`,
  );
  if (!skillsOk) allPassed = false;

  // Check 6: All companies present
  const companies = ["Datalogue", "Future Founder", "neuefische", "Otto Group", "alBaraka"];
  const missingCompanies = companies.filter((c) => !text.includes(c));
  const companiesOk = missingCompanies.length === 0;
  log(
    "All companies present",
    companiesOk,
    companiesOk ? undefined : `Missing: ${missingCompanies.join(", ")}`,
  );
  if (!companiesOk) allPassed = false;

  // Save text extraction
  const txtPath = pdfPath.replace(".pdf", ".txt");
  fs.writeFileSync(txtPath, text);
  console.log(`  Text saved: ${txtPath}`);

  console.log(
    `\n  Result: ${allPassed ? "ALL CHECKS PASSED" : "SOME CHECKS FAILED"}`,
  );
  return allPassed;
}

function log(check: string, passed: boolean, detail?: string) {
  const icon = passed ? "PASS" : "FAIL";
  const msg = detail ? ` (${detail})` : "";
  console.log(`  [${icon}] ${check}${msg}`);
}

// --- Main ---
console.log("CV PDF Generator (Typst — Dual Pipeline)");
console.log("=========================================");

let allOk = true;
for (const variant of selectedVariants) {
  for (const locale of locales) {
    const pdfPath = verifyOnly
      ? path.join(variant.outputDir, OUTPUT_FILE)
      : compile(variant, locale);

    if (variant.verify) {
      const ok = verifyAts(pdfPath);
      if (!ok) allOk = false;
    } else {
      // Basic check: file exists and is reasonable size
      const stat = fs.statSync(pdfPath);
      const sizeOk = stat.size > 50 * 1024; // > 50 KB
      log(
        `[${variant.id}] PDF size check (${(stat.size / 1024).toFixed(0)} KB)`,
        sizeOk,
      );
      if (!sizeOk) allOk = false;
    }
  }
}

console.log(
  `\n${allOk ? "Done. All verifications passed." : "WARNING: Some checks failed."}`,
);
process.exit(allOk ? 0 : 1);
