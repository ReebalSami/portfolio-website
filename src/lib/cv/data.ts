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

type CvVariant = "public" | "full";
type Locale = "en" | "de" | "es" | "ar";

const CV_DIR = path.resolve(process.cwd(), "config", "cv");

const cache = new Map<string, CvData>();
let privateCache: CvPrivateOverlay | null = null;

function getCvFilePath(variant: CvVariant): string {
  return path.join(CV_DIR, `cv.${variant}.yaml`);
}

function getPrivateFilePath(): string {
  return path.join(CV_DIR, "cv.private.yaml");
}

/**
 * Load and validate CV data for a given variant.
 * Returns fully typed CvData. Throws on validation failure with descriptive errors.
 */
export function loadCvData(variant: CvVariant = "public"): CvData {
  const cacheKey = variant;

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }

  const filePath = getCvFilePath(variant);

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
      `CV data validation failed for ${variant}:\n${issues}`
    );
  }

  cache.set(cacheKey, result.data);
  return result.data;
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
  cache.clear();
  privateCache = null;
}
