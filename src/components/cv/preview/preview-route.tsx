import { PortfolioGalleryTheme } from "@/components/cv/themes/portfolio-gallery";
import { PreviewBanner } from "@/components/cv/preview/preview-banner";
import { loadCvData } from "@/lib/cv/data";
import { getCvPreviewVariant, type CvVariantId } from "./variants";

type Locale = "en" | "de" | "es" | "ar";

interface PreviewRouteProps {
  variantId: CvVariantId;
  locale: Locale;
}

/**
 * Scaffold renderer for a /cv/option-N preview route.
 * Loads the shared CV data, fetches variant metadata, and currently
 * renders PortfolioGalleryTheme with the variant-specific photo so the
 * picker has something meaningful to show. Each variant gets a unique
 * view-transition-name so shared-element morphs don't mis-compose
 * across different photos.
 *
 * In later commits, this helper will dispatch to per-variant theme
 * components (EditorialMagazineTheme, BauhausSwissTheme, etc.).
 */
export async function PreviewRoute({ variantId, locale }: PreviewRouteProps) {
  const data = loadCvData("public");
  const variant = getCvPreviewVariant(variantId);

  return (
    <>
      <PreviewBanner variant={variant} locale={locale} />
      <PortfolioGalleryTheme
        data={data}
        locale={locale}
        photoSrc={variant.photoSrc}
        heroTransitionName={`hero-photo-${variant.id}`}
      />
    </>
  );
}
