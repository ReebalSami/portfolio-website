/**
 * Metadata for every CV hero variant shown on /cv/preview.
 * The actual theme component is mounted by each option-N route; this file
 * is the single source of truth for names, taglines, photos, and chroma.
 * See docs/design/transitions-and-hero-exploration.md §5.
 */

export type CvVariantId =
  | "option-1"
  | "option-2"
  | "option-3"
  | "option-4"
  | "option-5"
  | "option-6";

export interface CvPreviewVariant {
  id: CvVariantId;
  name: string;
  tagline: string;
  photoSrc: string;
  accent: string;
}

export const cvPreviewVariants: readonly CvPreviewVariant[] = [
  {
    id: "option-1",
    name: "Gallery Cover",
    tagline:
      "Distinct CV cover with eyebrow label, download CTAs in the hero, and a metadata strip — keeps the current aesthetic, removes the home-page similarity.",
    photoSrc: "/images/resume/option-3.JPG",
    accent: "from-gallery-warm/40 via-gallery-warm-muted/30 to-transparent",
  },
  {
    id: "option-2",
    name: "Editorial Magazine",
    tagline:
      "Big masthead display name with a serif accent and a horizontal metadata strip — reads like a print cover of a trade feature.",
    photoSrc: "/images/resume/option-1.JPG",
    accent: "from-amber-200/30 via-rose-100/30 to-transparent",
  },
  {
    id: "option-3",
    name: "Bauhaus Swiss",
    tagline:
      "Strict 12-column grid, numbered metadata (01 Location · 02 Languages · …), uppercase micro-type, warm geometric blocks. Restrained and precise.",
    photoSrc: "/images/resume/option-4.JPG",
    accent: "from-stone-300/40 via-gallery-warm/25 to-transparent",
  },
  {
    id: "option-4",
    name: "Kinetic AI",
    tagline:
      "CSS shader-noise backdrop, animated counters (6+ years · 12 projects · 5 languages), magnetic download button, kinetic name stagger. The AI-engineer variant.",
    photoSrc: "/images/resume/option-2.JPG",
    accent: "from-gallery-warm-light/50 via-gallery-warm/30 to-transparent",
  },
  {
    id: "option-5",
    name: "Japandi Zen",
    tagline:
      "Circular portrait, one-line tagline, serif name, vast whitespace, a single download CTA. Less-is-more.",
    photoSrc: "/images/resume/option-5.JPG",
    accent: "from-neutral-200/40 via-gallery-warm-muted/25 to-transparent",
  },
  {
    id: "option-6",
    name: "Cinematic Split",
    tagline:
      "50/50 split — full-bleed sticky photo fills the left half, content scrolls on the right. Film-poster drama.",
    photoSrc: "/images/resume/option-1.JPG",
    accent: "from-gallery-warm/40 via-orange-200/25 to-transparent",
  },
] as const;

export function getCvPreviewVariant(id: CvVariantId): CvPreviewVariant {
  const v = cvPreviewVariants.find((v) => v.id === id);
  if (!v) throw new Error(`Unknown CV preview variant: ${id}`);
  return v;
}
