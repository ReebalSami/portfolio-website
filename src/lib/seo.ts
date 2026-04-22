import { routing } from "@/i18n/routing";
import { getConfig, getSiteUrl } from "@/lib/config";

// ---------------------------------------------------------------------------
// URL helpers
// ---------------------------------------------------------------------------

function getSiteBase(): string {
  return getSiteUrl();
}

function normalizePath(path = ""): string {
  if (!path || path === "/") return "";
  return path.startsWith("/") ? path : `/${path}`;
}

export function getMetadataBase(): URL {
  return new URL(getSiteBase());
}

export function buildAbsoluteUrl(path = ""): string {
  if (path.startsWith("http")) return path;
  return `${getSiteBase()}${normalizePath(path)}`;
}

export function buildLocaleUrl(locale: string, path = ""): string {
  return `${getSiteBase()}/${locale}${normalizePath(path)}`;
}

// ---------------------------------------------------------------------------
// hreflang alternates (includes x-default → defaultLocale)
// ---------------------------------------------------------------------------

export function buildLanguageAlternates(path = ""): Record<string, string> {
  const alts: Record<string, string> = {};
  for (const locale of routing.locales) {
    alts[locale] = buildLocaleUrl(locale, path);
  }
  alts["x-default"] = buildLocaleUrl(routing.defaultLocale, path);
  return alts;
}

// ---------------------------------------------------------------------------
// OpenGraph locale mapping (BCP 47 → OG format)
// ---------------------------------------------------------------------------

const OG_LOCALE_MAP: Record<string, string> = {
  en: "en_US",
  de: "de_DE",
  es: "es_ES",
  ar: "ar_SA",
};

export function ogLocale(locale: string): string {
  return OG_LOCALE_MAP[locale] ?? locale;
}

export function ogAlternateLocales(currentLocale: string): string[] {
  return routing.locales
    .filter((l) => l !== currentLocale)
    .map(ogLocale);
}

// ---------------------------------------------------------------------------
// Twitter card validation
// ---------------------------------------------------------------------------

const VALID_TWITTER_CARDS = new Set([
  "summary_large_image",
  "summary",
  "player",
  "app",
] as const);

type TwitterCardType = "summary_large_image" | "summary" | "player" | "app";

export function resolveTwitterCard(): TwitterCardType {
  const requested = getConfig().seo.twitterCard ?? "summary_large_image";
  return (VALID_TWITTER_CARDS.has(requested as TwitterCardType)
    ? requested
    : "summary_large_image") as TwitterCardType;
}

export function resolveTwitterHandle(): string | undefined {
  return getConfig().seo.twitterHandle || undefined;
}

// ---------------------------------------------------------------------------
// JSON-LD safe serialization (escapes </script> to prevent XSS)
// ---------------------------------------------------------------------------

export function safeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
