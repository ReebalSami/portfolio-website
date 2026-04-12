import { setRequestLocale } from "next-intl/server";
import { loadCvData } from "@/lib/cv/data";
import { PortfolioGalleryTheme } from "@/components/cv/themes/portfolio-gallery";
import { CvDownloadFab } from "@/components/cv/cv-download-fab";
import { renderCvTheme } from "@/components/cv/themes";

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

  return (
    <>
      <PortfolioGalleryTheme data={data} locale={cvLocale} />
      <CvDownloadFab themes={downloadThemes} />
    </>
  );
}
