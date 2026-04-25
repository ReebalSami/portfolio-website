import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import {
  CvDataSchema,
  CvPrivateOverlaySchema,
  type CvData,
  type CvLocaleString,
  type CvPrivateOverlay,
} from "./schema";

// =============================================================================
// CV Data Loader — reads YAML, validates with Zod, returns typed data
// =============================================================================

type Locale = "en" | "de" | "es" | "ar";

const CV_DIR = path.resolve(process.cwd(), "config", "cv");

let publicCache: CvData | null = null;
let privateCache: CvPrivateOverlay | null = null;

function getPublicFilePath(): string {
  return path.join(CV_DIR, "cv.public.yaml");
}

function getPrivateFilePath(): string {
  return path.join(CV_DIR, "cv.private.yaml");
}

/**
 * Load and validate the public CV data (config/cv/cv.public.yaml).
 * Returns fully typed CvData. Throws on validation failure with descriptive errors.
 *
 * There is only one public CV source. For private PDF rendering, call
 * `mergeCvPrivateData(loadCvData())` to overlay real contact details from
 * cv.private.yaml (gitignored).
 */
export function loadCvData(): CvData {
  if (publicCache) {
    return publicCache;
  }

  const filePath = getPublicFilePath();

  if (!fs.existsSync(filePath)) {
    throw new Error(`CV data file not found: ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = parseYaml(raw);
  const result = CvDataSchema.safeParse(parsed);

  if (!result.success) {
    const issues = result.error.issues
      .map(
        (issue) =>
          `  - ${issue.path.join(".")}: ${issue.message}`
      )
      .join("\n");
    throw new Error(
      `CV data validation failed for cv.public.yaml:\n${issues}`
    );
  }

  publicCache = result.data;
  return publicCache;
}

/**
 * Load private overlay data (phone, address, reference contacts).
 * Returns null if the private file does not exist (expected in CI/deployment).
 */
export function loadCvPrivateData(): CvPrivateOverlay | null {
  if (privateCache !== undefined && privateCache !== null) {
    return privateCache;
  }

  const filePath = getPrivateFilePath();

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = parseYaml(raw);
  const result = CvPrivateOverlaySchema.safeParse(parsed);

  if (!result.success) {
    const issues = result.error.issues
      .map(
        (issue) =>
          `  - ${issue.path.join(".")}: ${issue.message}`
      )
      .join("\n");
    throw new Error(`CV private data validation failed:\n${issues}`);
  }

  privateCache = result.data;
  return privateCache;
}

/**
 * Merge private overlay data into base CV data.
 * Used for local PDF generation with full personal details.
 */
export function mergeCvPrivateData(base: CvData): CvData {
  const privateData = loadCvPrivateData();

  if (!privateData) {
    return base;
  }

  const merged = structuredClone(base);

  if (privateData.basics) {
    if (privateData.basics.email_personal) {
      merged.basics.email = privateData.basics.email_personal;
    }
    if (privateData.basics.phone) {
      merged.basics.phone = privateData.basics.phone;
    }
    if (privateData.basics.location) {
      if (privateData.basics.location.address) {
        merged.basics.location.address =
          privateData.basics.location.address;
      }
      if (privateData.basics.location.postalCode) {
        merged.basics.location.postalCode =
          privateData.basics.location.postalCode;
      }
    }
  }

  if (privateData.references && privateData.references.length > 0) {
    merged.references = privateData.references;
  }

  return merged;
}

/**
 * Extract locale-specific text from a CvLocaleString.
 * Falls back to English if the requested locale is not available.
 */
export function resolveCvLocaleString(
  str: CvLocaleString | string | undefined,
  locale: Locale
): string {
  if (!str) return "";
  if (typeof str === "string") return str;

  const value = str[locale as keyof CvLocaleString];
  if (value && value !== "[TODO]") return value;

  return str.en;
}

/**
 * Clear all cached CV data. Useful for testing and hot-reload scenarios.
 */
export function clearCvCache(): void {
  publicCache = null;
  privateCache = null;
}
