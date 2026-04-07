import type { Metadata } from "next";
import { Space_Grotesk, Archivo, JetBrains_Mono, IBM_Plex_Sans_Arabic } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ChatWidget } from "@/components/chat/chat-widget";
import { routing } from "@/i18n/routing";
import { getConfig } from "@/lib/config";

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

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: {
    default: `${config.site.name} — ${config.site.title}`,
    template: `%s | ${config.site.name}`,
  },
  description: config.site.description,
};

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
      className={`${fontClasses} h-full`}
    >
      <body className={`min-h-full flex flex-col ${isRtl ? "font-[var(--font-arabic)]" : ""}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <NextIntlClientProvider>
            <TooltipProvider>
              <Header siteName={config.site.name} />
              <main className="flex-1">{children}</main>
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
