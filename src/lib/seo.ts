import { routing } from "@/i18n/routing";
import { getConfig } from "@/lib/config";

function getSiteBase(): string {
  const {
    site: { url },
  } = getConfig();
  return url.replace(/\/$/, "");
}

function normalizePath(path = ""): string {
  if (!path || path === "/") {
    return "";
  }
  return path.startsWith("/") ? path : `/${path}`;
}

export function getMetadataBase(): URL {
  return new URL(getSiteBase());
}

export function buildAbsoluteUrl(path = ""): string {
  const base = getSiteBase();
  const normalized = path.startsWith("http") ? path : `${base}${normalizePath(path)}`;
  return normalized;
}

export function buildLocaleUrl(locale: string, path = ""): string {
  const base = getSiteBase();
  const normalized = normalizePath(path);
  return `${base}/${locale}${normalized}`;
}

export function buildLanguageAlternates(path = ""): Record<string, string> {
  return routing.locales.reduce<Record<string, string>>((acc, locale) => {
    acc[locale] = buildLocaleUrl(locale, path);
    return acc;
  }, {});
}
