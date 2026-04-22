import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { PreviewRoute } from "@/components/cv/preview/preview-route";
import { isCvPreviewEnabled } from "@/lib/cv/preview-flag";
import { routing } from "@/i18n/routing";

type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "CV Preview · Option 6 — Scroll Hero",
  robots: { index: false, follow: false },
};

export default async function Page({ params }: Props) {
  if (!isCvPreviewEnabled()) notFound();
  const { locale } = await params;
  setRequestLocale(locale);
  return <PreviewRoute variantId="option-6" locale={locale as "en" | "de" | "es" | "ar"} />;
}
