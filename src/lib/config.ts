import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import {
  PortfolioConfigSchema,
  type PortfolioConfig,
  type PhotoSlotId,
  type HeroConfig,
} from "@/types/config";

const CONFIG_PATH = path.resolve(process.cwd(), "config", "site.yaml");

/**
 * In production the YAML is baked in at build time, so caching is a pure
 * perf win. In dev we MUST re-read on every call so visual tuning knobs
 * in `site.yaml` (hero/lamp offsets, palette, animation) take effect on
 * page refresh without restarting the dev server. A `fs.readFileSync` of
 * a ~6 kB YAML is <1 ms; no meaningful cost for dev-time hot iteration.
 */
const IS_DEV = process.env.NODE_ENV !== "production";

let cachedConfig: PortfolioConfig | null = null;

export function getConfig(): PortfolioConfig {
  if (!IS_DEV && cachedConfig) {
    return cachedConfig;
  }

  const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
  const parsed = parseYaml(raw);
  const result = PortfolioConfigSchema.safeParse(parsed);

  if (!result.success) {
    console.error("Config validation failed:");
    console.error(JSON.stringify(result.error.issues, null, 2));
    throw new Error(
      `Invalid config/site.yaml: ${result.error.issues.length} validation error(s)`
    );
  }

  if (!IS_DEV) {
    cachedConfig = result.data;
  }
  return result.data;
}

export function getSiteConfig() {
  return getConfig().site;
}

export function getContactConfig() {
  return getConfig().contact;
}

export function getSocialConfig() {
  return getConfig().social;
}

export function getI18nConfig() {
  return getConfig().i18n;
}

export function getFeaturesConfig() {
  return getConfig().features;
}

export function getPhotosConfig() {
  return getConfig().photos;
}

/**
 * Resolve a photo slot to a public web path, joining `{dir}/{file}` from
 * `site.yaml`. Works both for the `<Image src>` prop (web) and as the left
 * half of a filesystem path when combined with `public/` (Typst pipeline).
 *
 * @example
 *   getPhotoPath("homepage") // "/images/homepage/hero/start-photo.JPG"
 *   getPhotoPath("cvPage")   // "/images/resume/option-1.JPG"
 *   getPhotoPath("cvPdf")    // "/images/cv/start-photo.JPG"
 */
export function getPhotoPath(slot: PhotoSlotId): string {
  const { dir, file } = getConfig().photos[slot];
  // Normalise the separator: trailing slash on dir OR leading slash on file
  // should not produce "//". Keep the leading slash on dir (public-root) so
  // <Image /> treats it as a domain-absolute URL.
  const trimmedDir = dir.endsWith("/") ? dir.slice(0, -1) : dir;
  const trimmedFile = file.startsWith("/") ? file.slice(1) : file;
  return `${trimmedDir}/${trimmedFile}`;
}

export function getDesignConfig() {
  return getConfig().design;
}

export function getAnalyticsConfig() {
  return getConfig().analytics;
}

export function getChatbotConfig() {
  return getConfig().chatbot;
}

export function getContactFormConfig() {
  return getConfig().contactForm;
}

export function getSeoConfig() {
  return getConfig().seo;
}

export function getAwsConfig() {
  return getConfig().aws;
}

export function getCvConfig() {
  return getConfig().cv;
}

export function getBuildConfig() {
  return getConfig().build;
}

export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? getConfig().site.url).replace(/\/$/, "");
}

/**
 * Hero / lamp visual tuning (iter-4 v5 — simplified).
 *
 * Defaults: zero x/y offsets on both text block and lamp (grid-centered
 * base positions), 60 × 40 rem bounding box, wall dropped, beams fading
 * into page bg, 1.6 s reveal, warm-honey light-mode palette. Reebal
 * tunes from `config/site.yaml`; anything omitted falls back here.
 */
const DEFAULT_HERO_CONFIG: HeroConfig = {
  textBlock: {
    x: "0",
    y: "0",
  },
  textBlockMobile: {
    x: "0",
    y: "0",
  },
  lamp: {
    anchor: {
      x: "50%",
      y: "0",
    },
    x: "0",
    y: "0",
    width: "60rem",
    height: "40rem",
    wallMode: "drop",
    surfaceMode: "background",
    animation: {
      durationSec: 1.6,
      delaySec: 0.3,
      mode: "replay",
    },
    palette: {
      light: {
        beam: "oklch(0.85 0.09 70)",
        glow: "oklch(0.88 0.07 70)",
        core: "oklch(0.92 0.08 65)",
      },
      dark: {
        beam: "oklch(0.78 0.14 55)",
        glow: "oklch(0.82 0.12 55)",
        core: "oklch(0.90 0.10 55)",
      },
    },
  },
  photoRelight: {
    enabled: true,
    profile: "balanced",
    baseTone: "slight-color-return",
    chromaOpacity: 0,
    chromaDirection: "right-to-left",
  },
};

export function getHeroConfig(): HeroConfig {
  return getConfig().hero ?? DEFAULT_HERO_CONFIG;
}
