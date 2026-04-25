/**
 * CV PDF Generator — Unified Typst Pipeline
 *
 * Compiles ATS (single-column) and/or Visual (two-column) CVs via Typst.
 * Runs ATS text extraction verification on the ATS variant.
 *
 * Two data sources:
 *   - public (default) — reads config/cv/cv.public.yaml; outputs BOTH ATS +
 *                        Visual to public/cv/{ats,visual}/ (DEPLOYED).
 *   - private          — merges cv.full.yaml + cv.private.yaml in memory;
 *                        outputs VISUAL ONLY to cover-letter/cv_private/
 *                        (gitignored, LOCAL ONLY, never deployed).
 *                        cv.full.yaml is a git-tracked mirror of cv.public.yaml
 *                        with application-specific wording (e.g. “my portfolio”
 *                        instead of “this portfolio”) and a references skeleton.
 *
 * Usage:
 *   pnpm tsx scripts/generate-cv.ts                              # public, both variants
 *   pnpm tsx scripts/generate-cv.ts --variant visual             # public Visual only
 *   pnpm tsx scripts/generate-cv.ts --source private             # private Visual only
 *   pnpm tsx scripts/generate-cv.ts --verify                     # verify public ATS PDF
 *   pnpm tsx scripts/generate-cv.ts --locale en                  # single locale
 */

import { execSync } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

const ROOT = path.resolve(new URL(".", import.meta.url).pathname, "..");
const FONT_PATH = path.join(ROOT, "scripts/typst/fonts");
const OUTPUT_FILE = "resume_reebal_sami.pdf";
const LOCALES = ["en"]; // Add "de", "es", "ar" when translations are complete

type CvSource = "public" | "private";

interface Variant {
  id: string;
  template: string;
  verify: boolean;
}

// Variant definitions without output dir — output is resolved per-source
// (public variants go to public/cv/{ats,visual}/ for deployment;
// private source produces VISUAL ONLY, written flat into
// cover-letter/cv_private/ which is gitignored via cover-letter/**).
const VARIANTS: Variant[] = [
  {
    id: "ats",
    template: path.join(ROOT, "scripts/typst/ats/cv-ats.typ"),
    verify: true,
  },
  {
    id: "visual",
    template: path.join(ROOT, "scripts/typst/visual/cv-visual.typ"),
    verify: false,
  },
];

const PRIVATE_OUTPUT_DIR = path.join(ROOT, "cover-letter/cv_private");

function getOutputDir(variant: Variant, source: CvSource): string {
  if (source === "private") {
    // Private source is visual-only and written flat (no variant subdir)
    // into cover-letter/cv_private/ — the filename already encodes the person.
    return PRIVATE_OUTPUT_DIR;
  }
  return path.join(ROOT, "public/cv", variant.id);
}

const EXPECTED_SECTIONS = [
  "Reebal Sami",
  "PROFILE",
  "EXPERIENCE",
  "EDUCATION",
];

function getExpectedPdfCompanies(sourceYamlPath: string): string[] {
  const fallback = ["Datalogue", "Future Founder", "neuefische", "Otto Group"];

  try {
    const raw = fs.readFileSync(sourceYamlPath, "utf-8");
    const parsed = parseYaml(raw) as {
      experience?: Array<{ company?: string; visibility?: string }>;
    };

    const companies = (parsed.experience ?? [])
      .filter((entry) => {
        const visibility = entry.visibility ?? "public";
        return visibility !== "extended" && visibility !== "private";
      })
      .map((entry) => entry.company)
      .filter((company): company is string => Boolean(company));

    const deduped = Array.from(new Set(companies));
    return deduped.length > 0 ? deduped : fallback;
  } catch {
    return fallback;
  }
}

// =============================================================================
// CV private-source merge logic
//
// Private CVs start from cv.full.yaml (git-tracked, safe-for-public-repo mirror
// of cv.public.yaml with application-specific wording and a references
// skeleton). The private source additionally overlays cv.private.yaml
// (gitignored) with real email, phone, address, and reference contacts.
//
// Public CVs continue to read cv.public.yaml directly — cv.full.yaml never
// touches the deployed output.
//
// The merged YAML is written to cover-letter/cv_private/.cv.merged.yaml
// (hidden file inside an already-gitignored dir; safe to leave on disk).
// Typst receives the path via --input data=...
// =============================================================================

interface PrivateOverlay {
  basics?: {
    email_personal?: string;
    phone?: string;
    location?: { address?: string; postalCode?: string };
  };
  references?: unknown[];
}

function buildMergedPrivateYaml(): string {
  const fullYamlPath = path.join(ROOT, "config/cv/cv.full.yaml");
  const privateYamlPath = path.join(ROOT, "config/cv/cv.private.yaml");

  if (!fs.existsSync(fullYamlPath)) {
    console.error(
      `ERROR: ${fullYamlPath} not found. Create cv.full.yaml (git-tracked
  mirror of cv.public.yaml with application-specific wording + references
  skeleton) before running \`make cv:private\`.`,
    );
    process.exit(1);
  }
  if (!fs.existsSync(privateYamlPath)) {
    console.error(
      `ERROR: ${privateYamlPath} not found. Create cv.private.yaml (gitignored) first.`,
    );
    console.error(
      `  It holds real email / phone / address / reference contacts and is
  merged over cv.full.yaml when you run \`make cv:private\`.`,
    );
    process.exit(1);
  }

  const fullRaw = fs.readFileSync(fullYamlPath, "utf-8");
  const privateRaw = fs.readFileSync(privateYamlPath, "utf-8");

  // parseYaml returns a plain object; we deliberately treat it as unknown shape
  // and merge only the fields we know about.
  const merged = parseYaml(fullRaw) as Record<string, unknown>;
  const privateData = parseYaml(privateRaw) as PrivateOverlay | null;

  if (!privateData) {
    console.warn("  cv.private.yaml parsed empty; using cv.full.yaml as-is.");
  } else {
    const basics = (merged.basics ?? {}) as Record<string, unknown>;

    if (privateData.basics?.email_personal) {
      basics.email = privateData.basics.email_personal;
    }
    if (privateData.basics?.phone) {
      basics.phone = privateData.basics.phone;
    }
    if (privateData.basics?.location) {
      const location = (basics.location ?? {}) as Record<string, unknown>;
      if (privateData.basics.location.address) {
        location.address = privateData.basics.location.address;
      }
      if (privateData.basics.location.postalCode) {
        location.postalCode = privateData.basics.location.postalCode;
      }
      basics.location = location;
    }
    merged.basics = basics;

    if (privateData.references && privateData.references.length > 0) {
      merged.references = privateData.references;
    }
  }

  fs.mkdirSync(PRIVATE_OUTPUT_DIR, { recursive: true });
  const mergedPath = path.join(PRIVATE_OUTPUT_DIR, ".cv.merged.yaml");
  const header =
    "# AUTO-GENERATED from cv.full.yaml + cv.private.yaml. Do not edit by hand.\n";
  fs.writeFileSync(mergedPath, header + stringifyYaml(merged), "utf-8");

  console.log(`  Merged private CV written: ${path.relative(ROOT, mergedPath)}`);
  return mergedPath;
}

function getDataPathForCompile(source: CvSource): {
  workspaceRelative: string;
  absolute: string;
} {
  if (source === "private") {
    const mergedAbs = buildMergedPrivateYaml();
    return {
      workspaceRelative: path.relative(ROOT, mergedAbs),
      absolute: mergedAbs,
    };
  }
  const publicAbs = path.join(ROOT, "config/cv/cv.public.yaml");
  return {
    workspaceRelative: "config/cv/cv.public.yaml",
    absolute: publicAbs,
  };
}

function getExpectedEmail(dataYamlAbs: string): string {
  try {
    const raw = fs.readFileSync(dataYamlAbs, "utf-8");
    const parsed = parseYaml(raw) as { basics?: { email?: string } };
    return parsed.basics?.email ?? "contact@reebal-sami.com";
  } catch {
    return "contact@reebal-sami.com";
  }
}

// --- Parse CLI args ---
const args = process.argv.slice(2);
const verifyOnly = args.includes("--verify");
const variantArg = args.find((_, i, a) => a[i - 1] === "--variant");
const localeArg = args.find((_, i, a) => a[i - 1] === "--locale");
const sourceArgRaw = args.find((_, i, a) => a[i - 1] === "--source") ?? "public";
if (sourceArgRaw !== "public" && sourceArgRaw !== "private") {
  console.error(`Unknown source: ${sourceArgRaw}. Use "public" or "private".`);
  process.exit(1);
}
const source: CvSource = sourceArgRaw;
const locales = localeArg ? [localeArg] : LOCALES;

// For the private source we deliberately emit ONLY the Visual variant —
// the ATS variant is for machine parsing of the deployed public CV, and
// there is no use case for a private ATS version (direct applications
// send the Visual CV + cover letter alongside it).
const defaultVariantsForSource = source === "private"
  ? VARIANTS.filter((v) => v.id === "visual")
  : VARIANTS;

const selectedVariants = variantArg
  ? defaultVariantsForSource.filter((v) => v.id === variantArg)
  : defaultVariantsForSource;

if (variantArg && selectedVariants.length === 0) {
  if (source === "private" && variantArg === "ats") {
    console.error(
      `The private source is visual-only — an ATS private CV is never emitted.`,
    );
  } else {
    console.error(`Unknown variant: ${variantArg}. Use "ats" or "visual".`);
  }
  process.exit(1);
}

/**
 * Copy the `photos.cvPdf` file configured in `config/site.yaml` into
 * `scripts/typst/assets/profile-photo.png` so Typst's hardcoded template
 * path keeps working. Typst is content-sniff, so the `.png` filename
 * holding JPG bytes (or vice versa) is fine. Runs once per script
 * invocation before the first compile.
 *
 * This is what lets Reebal swap the CV-PDF photo by editing a single line
 * of site.yaml without touching code or Typst templates.
 */
function syncCvPdfPhoto(): void {
  const siteYamlPath = path.join(ROOT, "config/site.yaml");
  type SiteYaml = {
    photos?: { cvPdf?: { file?: string; dir?: string } };
  };
  const cfg = parseYaml(fs.readFileSync(siteYamlPath, "utf-8")) as SiteYaml;
  const slot = cfg.photos?.cvPdf;
  if (!slot?.file || !slot?.dir) {
    console.warn(
      "  Photo sync skipped: site.yaml `photos.cvPdf` is missing file/dir.",
    );
    return;
  }
  // dir is public-root-relative (e.g. "/images/cv"); strip the leading slash
  // for filesystem joining under `public/`.
  const normalisedDir = slot.dir.startsWith("/")
    ? slot.dir.slice(1)
    : slot.dir;
  const src = path.join(ROOT, "public", normalisedDir, slot.file);
  const dst = path.join(ROOT, "scripts/typst/assets/profile-photo.png");
  if (!fs.existsSync(src)) {
    console.warn(
      `  Photo sync skipped: source file missing at ${path.relative(ROOT, src)}. Typst will use the existing asset.`,
    );
    return;
  }
  fs.copyFileSync(src, dst);
  console.log(
    `  Photo synced: ${path.relative(ROOT, src)} -> scripts/typst/assets/profile-photo.png`,
  );
}

function compile(variant: Variant, locale: string, dataWorkspaceRelative: string): string {
  const outputDir = getOutputDir(variant, source);
  const outPath = path.join(outputDir, OUTPUT_FILE);
  fs.mkdirSync(outputDir, { recursive: true });
  const shapeSeed = Math.floor(Math.random() * 1_000_000) + 1;

  console.log(`\n  [${variant.id}] Compiling for locale: ${locale} (source: ${source})`);
  const cmd = `typst compile --root "${ROOT}" --font-path "${FONT_PATH}" "${variant.template}" "${outPath}" --input locale=${locale} --input shapeSeed=${shapeSeed} --input data="${dataWorkspaceRelative}" --input variant=${source}`;

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

function verifyAts(pdfPath: string, expectedEmail: string, sourceYamlPath: string): boolean {
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

  // Check 2: Expected email in first 10 lines (source-aware)
  const emailInTop = lines.slice(0, 10).some((l) => l.includes(expectedEmail));
  log(`Email "${expectedEmail}" in first 10 lines`, emailInTop);
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
  const companies = getExpectedPdfCompanies(sourceYamlPath);
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
console.log(`CV PDF Generator (Typst — source: ${source})`);
console.log("=========================================");

// Sync the CV-PDF photo from site.yaml BEFORE compiling. Skipped in verify-only
// mode since that doesn't re-render the PDF — it only re-reads the existing
// one. Runs once per script invocation, both variants share the synced asset.
if (!verifyOnly) {
  syncCvPdfPhoto();
}

// Resolve data path once per run (merges private overlay for private source).
const dataPath = verifyOnly
  ? {
      workspaceRelative:
        source === "private"
          ? "cover-letter/cv_private/.cv.merged.yaml"
          : "config/cv/cv.public.yaml",
      absolute:
        source === "private"
          ? path.join(PRIVATE_OUTPUT_DIR, ".cv.merged.yaml")
          : path.join(ROOT, "config/cv/cv.public.yaml"),
    }
  : getDataPathForCompile(source);
const expectedEmail = getExpectedEmail(dataPath.absolute);

let allOk = true;
for (const variant of selectedVariants) {
  for (const locale of locales) {
    const outputDir = getOutputDir(variant, source);
    const pdfPath = verifyOnly
      ? path.join(outputDir, OUTPUT_FILE)
      : compile(variant, locale, dataPath.workspaceRelative);

    if (variant.verify) {
      const ok = verifyAts(pdfPath, expectedEmail, dataPath.absolute);
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
