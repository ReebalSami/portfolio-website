import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Archivo, JetBrains_Mono, IBM_Plex_Sans_Arabic, Caveat } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ViewTransitions } from "next-view-transitions";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ChatWidget } from "@/components/chat/chat-widget";
import { ChatLayoutProvider } from "@/lib/layout/chat-layout-context";
import { JsonLd } from "@/components/seo/json-ld";
import { PlausibleAnalytics } from "@/components/analytics/plausible";
import { routing } from "@/i18n/routing";
import { getConfig } from "@/lib/config";
import {
  buildLanguageAlternates,
  buildLocaleUrl,
  buildAbsoluteUrl,
  getMetadataBase,
  ogLocale,
  ogAlternateLocales,
  resolveTwitterCard,
  resolveTwitterHandle,
} from "@/lib/seo";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const archivo = Archivo({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const caveat = Caveat({
  variable: "--font-handwritten",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const config = getConfig();
const metadataBase = getMetadataBase();

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f7" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1c22" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const canonical = buildLocaleUrl(locale);
  const languages = buildLanguageAlternates();

  const ogImageUrl = config.seo.ogImage
    ? buildAbsoluteUrl(config.seo.ogImage)
    : `${canonical}/opengraph-image`;

  const defaultTitle = `${config.site.name} — ${config.site.title}`;

  return {
    metadataBase,
    title: {
      default: defaultTitle,
      template: `%s | ${config.site.name}`,
    },
    description: config.site.description,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      type: "website",
      locale: ogLocale(locale),
      alternateLocale: ogAlternateLocales(locale),
      url: canonical,
      siteName: config.site.name,
      title: defaultTitle,
      description: config.site.description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: defaultTitle,
        },
      ],
    },
    twitter: {
      card: resolveTwitterCard(),
      title: defaultTitle,
      description: config.site.description,
      creator: resolveTwitterHandle(),
      images: [ogImageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    icons: {
      icon: "/icon.svg",
      apple: "/apple-icon.png",
    },
  };
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const tCommon = await getTranslations("common");

  const isRtl = locale === "ar";

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: config.site.name,
    description: config.site.description,
    url: config.site.url,
    inLanguage: routing.locales,
    publisher: {
      "@type": "Person",
      name: config.site.name,
      url: config.site.url,
    },
  };
  const fontClasses = [
    spaceGrotesk.variable,
    archivo.variable,
    jetbrainsMono.variable,
    caveat.variable,
    isRtl ? ibmPlexArabic.variable : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <ViewTransitions>
    <html
      lang={locale}
      dir={isRtl ? "rtl" : "ltr"}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={fontClasses}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t!=="light")document.documentElement.classList.add("dark")}catch(e){}})()`,
          }}
        />
        {routing.locales.map((loc) => (
          <link
            key={`rss-${loc}`}
            rel="alternate"
            type="application/rss+xml"
            title={`${config.site.name} Blog (${loc.toUpperCase()})`}
            href={`${config.site.url}/feed/${loc}`}
          />
        ))}
        <PlausibleAnalytics />
      </head>
      <body className={`min-h-dvh flex flex-col ${isRtl ? "font-[var(--font-arabic)]" : ""}`}>
        <a href="#main-content" className="skip-link">
          {tCommon("skipToContent")}
        </a>
        <JsonLd id="website-structured-data" data={websiteJsonLd} />
        <ThemeProvider defaultTheme="light">
          <NextIntlClientProvider>
            <TooltipProvider>
              <ChatLayoutProvider>
                <Header siteName={config.site.name} />
                <main id="main-content" className="flex-1">
                  {children}
                </main>
                {config.features.chatbot && <ChatWidget />}
                <Footer
                  siteName={config.site.name}
                  email={config.contact.email}
                  location={config.contact.location}
                  social={config.social}
                />
              </ChatLayoutProvider>
            </TooltipProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
    </ViewTransitions>
  );
}
