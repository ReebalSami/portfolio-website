import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { loadCvData, resolveCvLocaleString } from "@/lib/cv/data";
import { PortfolioGalleryTheme } from "@/components/cv/themes/portfolio-gallery";
import { CvDownloadFab } from "@/components/cv/cv-download-fab";
import { renderCvTheme } from "@/components/cv/themes";
import { JsonLd } from "@/components/seo/json-ld";
import { routing } from "@/i18n/routing";
import { getConfig } from "@/lib/config";
import {
  buildLocaleUrl,
  buildLanguageAlternates,
  getMetadataBase,
  ogLocale,
  ogAlternateLocales,
  resolveTwitterCard,
} from "@/lib/seo";

type Locale = "en" | "de" | "es" | "ar";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ theme?: string; print?: string }>;
};

const downloadThemes = [
  { id: "portfolio-gallery", name: "Portfolio", pdfUrl: "/cv/portfolio/resume_reebal_sami.pdf" },
  { id: "canva-elegant", name: "Elegant", pdfUrl: "/cv/elegant/resume_reebal_sami.pdf" },
  { id: "soulful", name: "Soulful", pdfUrl: "/cv/soulful/resume_reebal_sami.pdf" },
];

const validPdfThemes = new Set(["canva-elegant", "soulful", "portfolio-gallery"]);

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cv" });
  const config = getConfig();
  const canonical = buildLocaleUrl(locale, "/cv");
  const languages = buildLanguageAlternates("/cv");

  return {
    metadataBase: getMetadataBase(),
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      type: "profile",
      locale: ogLocale(locale),
      alternateLocale: ogAlternateLocales(locale),
      url: canonical,
      siteName: config.site.name,
      title: t("metaTitle"),
      description: t("metaDescription"),
    },
    twitter: {
      card: resolveTwitterCard(),
      title: t("metaTitle"),
      description: t("metaDescription"),
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function CvPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { theme: themeParam, print: printParam } = await searchParams;
  setRequestLocale(locale);

  const data = loadCvData("public");
  const cvLocale = locale as Locale;

  if (themeParam && validPdfThemes.has(themeParam) && printParam === "true") {
    return renderCvTheme(themeParam, {
      data,
      locale: cvLocale,
      printMode: true,
    });
  }

  const config = getConfig();
  const profileSummary = resolveCvLocaleString(data.profile.summary, cvLocale);
  const profileUrls = data.basics.profiles.map((p) => p.url);

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: data.basics.name,
    jobTitle: resolveCvLocaleString(data.basics.title, cvLocale),
    url: config.site.url,
    email: data.basics.email,
    description: profileSummary,
    sameAs: profileUrls,
    knowsLanguage: data.languages.map((l) => resolveCvLocaleString(l.language, "en")),
    address: {
      "@type": "PostalAddress",
      addressLocality: resolveCvLocaleString(data.basics.location.city, cvLocale),
      addressCountry: resolveCvLocaleString(data.basics.location.country, cvLocale),
    },
  };

  return (
    <>
      <JsonLd id="cv-person-structured-data" data={personJsonLd} />
      <PortfolioGalleryTheme data={data} locale={cvLocale} />
      <CvDownloadFab themes={downloadThemes} />
    </>
  );
}
