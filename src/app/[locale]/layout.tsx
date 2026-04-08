import type { Metadata } from "next";
import { Space_Grotesk, Archivo, JetBrains_Mono, IBM_Plex_Sans_Arabic } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PageTransition } from "@/components/layout/page-transition";
import { ChatWidget } from "@/components/chat/chat-widget";
import { routing } from "@/i18n/routing";
import { getConfig } from "@/lib/config";
import { buildLanguageAlternates, buildLocaleUrl, buildAbsoluteUrl, getMetadataBase } from "@/lib/seo";

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

const config = getConfig();
const metadataBase = getMetadataBase();
const twitterCardOptions = new Set(["summary_large_image", "summary", "player", "app"]);

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const canonical = buildLocaleUrl(locale);
  const languages = buildLanguageAlternates();
  const ogImages = [
    {
      url: `${canonical}/opengraph-image`,
      width: 1200,
      height: 630,
    },
  ];

  if (config.seo.ogImage) {
    ogImages.push({
      url: buildAbsoluteUrl(config.seo.ogImage),
      width: 1200,
      height: 630,
    });
  }

  const defaultTitle = `${config.site.name} — ${config.site.title}`;
  const requestedCard = config.seo.twitterCard ?? "summary_large_image";
  const twitterCard = (twitterCardOptions.has(requestedCard)
    ? requestedCard
    : "summary_large_image") as "summary_large_image" | "summary" | "player" | "app";

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
      locale,
      url: canonical,
      siteName: config.site.name,
      title: defaultTitle,
      description: config.site.description,
      images: ogImages,
    },
    twitter: {
      card: twitterCard,
      title: defaultTitle,
      description: config.site.description,
      creator: config.seo.twitterHandle || undefined,
      images: ogImages.map((image) => image.url),
    },
    robots: {
      index: true,
      follow: true,
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

  const isRtl = locale === "ar";
  const fontClasses = [
    spaceGrotesk.variable,
    archivo.variable,
    jetbrainsMono.variable,
    isRtl ? ibmPlexArabic.variable : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <html
      lang={locale}
      dir={isRtl ? "rtl" : "ltr"}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${fontClasses} h-full`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="dark")document.documentElement.classList.add("dark")}catch(e){}})()`,
          }}
        />
      </head>
      <body className={`min-h-full flex flex-col ${isRtl ? "font-[var(--font-arabic)]" : ""}`}>
        <ThemeProvider defaultTheme="light">
          <NextIntlClientProvider>
            <TooltipProvider>
              <Header siteName={config.site.name} />
              <PageTransition>
                <main id="main-content" className="flex-1">
                  {children}
                </main>
              </PageTransition>
              {config.features.chatbot && <ChatWidget />}
              <Footer
                siteName={config.site.name}
                email={config.contact.email}
                location={config.contact.location}
                social={config.social}
              />
            </TooltipProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
