import { PortfolioGalleryTheme } from "@/components/cv/themes/portfolio-gallery";
import { MirroredCanonicalTheme } from "@/components/cv/themes/variants/mirrored-canonical-theme";
import { EditorialMagazineTheme } from "@/components/cv/themes/variants/editorial-magazine-theme";
import { KineticAiTheme } from "@/components/cv/themes/variants/kinetic-ai-theme";
import { ScrollHeroTheme } from "@/components/cv/themes/variants/scroll-hero-theme";
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
  const data = loadCvData();
  const variant = getCvPreviewVariant(variantId);
  const transitionName = `hero-photo-${variant.id}`;

  const body = (() => {
    switch (variantId) {
      case "option-1":
        return (
          <MirroredCanonicalTheme
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
        // Classic Canonical — the previously-live PortfolioGalleryTheme,
        // preserved here as a preview slot since iter-3 swapped /cv to
        // EditorialMagazineTheme. Lets us A/B against the new canonical
        // without losing the original design.
        return (
          <PortfolioGalleryTheme
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
      case "option-6":
        return (
          <ScrollHeroTheme
            data={data}
            locale={locale}
            photoSrc={variant.photoSrc}
            heroTransitionName={transitionName}
          />
        );
      default:
        // Safety fallback — every variantId in the union has an explicit case.
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
