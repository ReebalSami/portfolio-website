import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { loadCvData, resolveCvLocaleString } from "@/lib/cv/data";
import { EditorialMagazineTheme } from "@/components/cv/themes/variants/editorial-magazine-theme";
import { JsonLd } from "@/components/seo/json-ld";
import { routing } from "@/i18n/routing";
import { getConfig } from "@/lib/config";
import { HERO_VIEW_TRANSITION_NAME } from "@/lib/view-transitions";
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

export default async function CvPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const data = loadCvData("public");
  const cvLocale = locale as Locale;
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
      {/* Canonical /cv since iter-3 = Editorial Magazine. Theme owns its
          own <CvDownloadFab /> so we don't render one here. The classic
          PortfolioGalleryTheme is preserved at /cv/option-3 for A/B and
          history. heroTransitionName="hero-photo" matches the homepage
          shared-element morph (preview routes use "hero-photo-option-N"
          to avoid name collisions with the canonical). */}
      <EditorialMagazineTheme
        data={data}
        locale={cvLocale}
        heroTransitionName={HERO_VIEW_TRANSITION_NAME}
      />
    </>
  );
}
