import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { PreviewRoute } from "@/components/cv/preview/preview-route";
import { routing } from "@/i18n/routing";

type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "CV Preview · Option 1 — Gallery Cover",
  robots: { index: false, follow: false },
};

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PreviewRoute variantId="option-1" locale={locale as "en" | "de" | "es" | "ar"} />;
}
