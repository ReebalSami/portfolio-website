import { PortfolioGalleryTheme } from "@/components/cv/themes/portfolio-gallery";
import { GalleryCoverTheme } from "@/components/cv/themes/variants/gallery-cover-theme";
import { EditorialMagazineTheme } from "@/components/cv/themes/variants/editorial-magazine-theme";
import { BauhausSwissTheme } from "@/components/cv/themes/variants/bauhaus-swiss-theme";
import { KineticAiTheme } from "@/components/cv/themes/variants/kinetic-ai-theme";
import { JapandiZenTheme } from "@/components/cv/themes/variants/japandi-zen-theme";
import { CinematicSplitTheme } from "@/components/cv/themes/variants/cinematic-split-theme";
import { PreviewBanner } from "@/components/cv/preview/preview-banner";
import { loadCvData } from "@/lib/cv/data";
import { getCvPreviewVariant, type CvVariantId } from "./variants";

type Locale = "en" | "de" | "es" | "ar";

interface PreviewRouteProps {
  variantId: CvVariantId;
  locale: Locale;
}

/**
 * Preview route renderer — loads CV data and dispatches to the variant's
 * bespoke hero theme. Each variant wraps <CvBody /> for the two-column body,
 * so only the hero differs between variants (which is what we compare).
 *
 * Variants not yet implemented fall back to PortfolioGalleryTheme with the
 * variant's photo so the picker has something meaningful to show.
 */
export async function PreviewRoute({ variantId, locale }: PreviewRouteProps) {
  const data = loadCvData("public");
  const variant = getCvPreviewVariant(variantId);
  const transitionName = `hero-photo-${variant.id}`;

  const body = (() => {
    switch (variantId) {
      case "option-1":
        return (
          <GalleryCoverTheme
            data={data}
            locale={locale}
            photoSrc={variant.photoSrc}
            heroTransitionName={transitionName}
          />
        );
      case "option-2":
        return (
          <EditorialMagazineTheme
            data={data}
            locale={locale}
            photoSrc={variant.photoSrc}
            heroTransitionName={transitionName}
          />
        );
      case "option-3":
        return (
          <BauhausSwissTheme
            data={data}
            locale={locale}
            photoSrc={variant.photoSrc}
            heroTransitionName={transitionName}
          />
        );
      case "option-4":
        return (
          <KineticAiTheme
            data={data}
            locale={locale}
            photoSrc={variant.photoSrc}
            heroTransitionName={transitionName}
          />
        );
      case "option-5":
        return (
          <JapandiZenTheme
            data={data}
            locale={locale}
            photoSrc={variant.photoSrc}
            heroTransitionName={transitionName}
          />
        );
      case "option-6":
        return (
          <CinematicSplitTheme
            data={data}
            locale={locale}
            photoSrc={variant.photoSrc}
            heroTransitionName={transitionName}
          />
        );
      default:
        // All 6 variants are now wired; this remains as a safety net.
        return (
          <PortfolioGalleryTheme
            data={data}
            locale={locale}
            photoSrc={variant.photoSrc}
            heroTransitionName={transitionName}
          />
        );
    }
  })();

  return (
    <>
      <PreviewBanner variant={variant} locale={locale} />
      {body}
    </>
  );
}
