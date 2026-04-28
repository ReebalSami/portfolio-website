import { z } from "zod/v4";

export const SiteConfigSchema = z.object({
  name: z.string(),
  title: z.string(),
  tagline: z.string(),
  description: z.string(),
  url: z.url(),
  repo: z.url(),
});

export const ContactConfigSchema = z.object({
  email: z.email(),
  location: z.string(),
});

export const SocialConfigSchema = z.object({
  linkedin: z.url(),
  github: z.url(),
  twitter: z.url().optional(),
  medium: z.url().optional(),
});

export const I18nConfigSchema = z.object({
  defaultLocale: z.string(),
  locales: z.array(z.string()),
  rtlLocales: z.array(z.string()),
  localeNames: z.record(z.string(), z.string()),
});

export const FeaturesConfigSchema = z.object({
  blog: z.boolean(),
  chatbot: z.boolean(),
  contactForm: z.boolean(),
  darkMode: z.boolean(),
  analytics: z.boolean(),
  rss: z.boolean(),
  downloadCV: z.boolean(),
  cv: z.boolean(),
  /**
   * Homepage Journey (M7).
   *
   * `false` → old vertical `TimelineEntryCard` list inside AboutSection.
   * `true`  → new horizontal cinematic `<CompactJourney />` carousel + About
   *           nav becomes a hover-dropdown (Who / Journey / Tech).
   *
   * Flip this one line in `config/site.yaml` to go live; no redeploy needed
   * for production because the YAML is baked in at build time (dev re-reads
   * on every request, so toggling is instant in dev too).
   */
  compactTimeline: z.boolean().default(false),
});

/**
 * Each photo slot = `{ file, dir }`. The full path is just `${dir}/${file}`;
 * storing them separately keeps the YAML readable (you can see at a glance
 * which folder each image lives in) and lets consumers that only need the
 * directory (e.g. Next.js Image `loader`) grab it without string-splitting.
 * Use `getPhotoPath("slot")` from `@/lib/config` to resolve the joined path.
 */
export const PhotoSlotSchema = z.object({
  file: z.string(),
  dir: z.string(),
});

export const PhotosConfigSchema = z.object({
  /** Homepage hero photo (also feeds JSON-LD + OG fallback). */
  homepage: PhotoSlotSchema,
  /** Canonical /cv page hero photo (Editorial theme). */
  cvPage: PhotoSlotSchema,
  /** Photo baked into ATS + Visual PDFs via the Typst pipeline. */
  cvPdf: PhotoSlotSchema,
  treatment: z.string(),
});

export const DesignConfigSchema = z.object({
  fonts: z.object({
    heading: z.string(),
    body: z.string(),
    mono: z.string(),
    arabic: z.string(),
  }),
  borderRadius: z.object({
    small: z.string(),
    medium: z.string(),
    large: z.string(),
  }),
  maxWidth: z.string(),
  contentWidth: z.string(),
});

export const AnalyticsConfigSchema = z.object({
  provider: z.string(),
  siteId: z.string(),
  scriptUrl: z.url(),
});

export const ChatbotConfigSchema = z.object({
  provider: z.string(),
  model: z.string(),
  apiKeyEnvVar: z.string(),
  maxTokens: z.number().int().positive(),
  rateLimit: z.object({
    maxRequests: z.number().int().positive(),
    windowSeconds: z.number().int().positive(),
  }),
});

export const ContactFormConfigSchema = z.object({
  provider: z.string(),
  apiKeyEnvVar: z.string(),
  honeypotField: z.string(),
});

export const SeoConfigSchema = z.object({
  ogImage: z.string(),
  twitterCard: z.string(),
  twitterHandle: z.string().optional(),
});

export const AwsConfigSchema = z.object({
  region: z.string(),
  cdkStack: z.string(),
  stages: z.object({
    preview: z.object({
      subdomain: z.string(),
    }),
    prod: z.object({
      customDomain: z.string(),
    }),
  }),
});

export const CvVariantConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  pdfPath: z.string(),
});

export const CvConfigSchema = z.object({
  variants: z.array(CvVariantConfigSchema),
  defaultVariant: z.string(),
});

export const BuildConfigSchema = z.object({
  outputDir: z.string(),
});

/**
 * Hero / lamp tuning knobs (iter-4 v5 — simplified).
 *
 * Four position offsets (`textBlock.{x,y}`, `lamp.{x,y}`) plus size,
 * wall/surface mode, animation timing, and palette. Animations always
 * play on every refresh — no replay control. Text+lamp are always
 * grid-centered horizontally (pre-lamp behaviour). Defaults live in
 * `src/lib/config.ts` so omitting `hero` entirely is valid.
 */
export const HeroTextBlockConfigSchema = z.object({
  /** Horizontal offset from the text block's grid-centered base. Any CSS length. */
  x: z.string(),
  /** Vertical offset from the text block's grid-centered base. Any CSS length. */
  y: z.string(),
});

export const HeroLampAnchorSchema = z.object({
  /** Horizontal anchor position inside the hero text column. */
  x: z.string(),
  /** Vertical anchor position inside the hero text column. */
  y: z.string(),
});

export const HeroLampAnimationSchema = z.object({
  durationSec: z.number().positive(),
  delaySec: z.number().min(0),
  /** replay -> animate from start each mount, static -> render end-state. */
  mode: z.enum(["replay", "static"]).default("replay"),
});

export const HeroLampPaletteModeSchema = z.object({
  beam: z.string(),
  glow: z.string(),
  core: z.string(),
});

export const HeroLampPaletteSchema = z.object({
  light: HeroLampPaletteModeSchema,
  dark: HeroLampPaletteModeSchema,
});

export const HeroLampConfigSchema = z.object({
  /** Base anchor in the parent column (before lamp.x / lamp.y deltas). */
  anchor: HeroLampAnchorSchema.default({ x: "50%", y: "0" }),
  /** Horizontal offset from the lamp's grid-centered base (same centre as text). */
  x: z.string(),
  /** Vertical offset from the lamp's base (column top). */
  y: z.string(),
  /** Size of the lamp bounding box. Aceternity reveal sizes scale with these. */
  width: z.string(),
  height: z.string(),
  /** "drop" removes wall AND horizon line. "keep" renders Aceternity original. */
  wallMode: z.enum(["drop", "keep"]),
  /** "background" → beam edges fade into var(--background). "transparent" → raw. */
  surfaceMode: z.enum(["background", "transparent"]),
  animation: HeroLampAnimationSchema,
  palette: HeroLampPaletteSchema,
});

export const HeroPhotoRelightProfileSchema = z.enum([
  "subtle",
  "balanced",
  "pronounced",
]);

export const HeroPhotoRelightToneSchema = z.enum([
  "keep-grayscale",
  "slight-color-return",
]);

export const HeroChromaDirectionSchema = z.enum([
  "right-to-left",
  "bottom-to-top",
  "center",
]);

export const HeroPhotoRelightConfigSchema = z.object({
  /** Master switch for relight overlays in the homepage hero photo. */
  enabled: z.boolean().default(true),
  /** Preset intensity profile. */
  profile: HeroPhotoRelightProfileSchema.default("balanced"),
  /** Base photo tone behavior in the lit area. */
  baseTone: HeroPhotoRelightToneSchema.default("slight-color-return"),
  /** 0 = off (grayscale only). 0–1 blends a saturated copy of the photo in from chromaDirection. */
  chromaOpacity: z.number().min(0).max(1).default(0),
  /** Which edge the color return bleeds in from. Only used when chromaOpacity > 0. */
  chromaDirection: HeroChromaDirectionSchema.default("right-to-left"),
});

export const DEFAULT_PHOTO_RELIGHT = {
  enabled: true,
  profile: "balanced" as const,
  baseTone: "slight-color-return" as const,
  chromaOpacity: 0,
  chromaDirection: "right-to-left" as const,
};

export const HeroConfigSchema = z.object({
  textBlock: HeroTextBlockConfigSchema,
  /**
   * Mobile-only text-block translate. Defaults to (0, 0) so narrow
   * viewports do not inherit desktop offsets like "-10%" which pushed the
   * name heading past the left viewport edge at 375 px. Set per-axis to
   * offset on mobile independently.
   */
  textBlockMobile: HeroTextBlockConfigSchema.default({ x: "0", y: "0" }),
  lamp: HeroLampConfigSchema,
  photoRelight: HeroPhotoRelightConfigSchema.default(DEFAULT_PHOTO_RELIGHT),
});

export const PortfolioConfigSchema = z.object({
  site: SiteConfigSchema,
  contact: ContactConfigSchema,
  social: SocialConfigSchema,
  i18n: I18nConfigSchema,
  features: FeaturesConfigSchema,
  photos: PhotosConfigSchema,
  design: DesignConfigSchema,
  analytics: AnalyticsConfigSchema,
  chatbot: ChatbotConfigSchema,
  contactForm: ContactFormConfigSchema,
  seo: SeoConfigSchema,
  cv: CvConfigSchema,
  aws: AwsConfigSchema,
  build: BuildConfigSchema,
  // Optional in the schema so a site.yaml without a `hero` block still
  // validates; the loader merges defaults on read.
  hero: HeroConfigSchema.optional(),
});

export type SiteConfig = z.infer<typeof SiteConfigSchema>;
export type ContactConfig = z.infer<typeof ContactConfigSchema>;
export type SocialConfig = z.infer<typeof SocialConfigSchema>;
export type I18nConfig = z.infer<typeof I18nConfigSchema>;
export type FeaturesConfig = z.infer<typeof FeaturesConfigSchema>;
export type PhotoSlot = z.infer<typeof PhotoSlotSchema>;
export type PhotosConfig = z.infer<typeof PhotosConfigSchema>;
export type PhotoSlotId = keyof Pick<PhotosConfig, "homepage" | "cvPage" | "cvPdf">;
export type DesignConfig = z.infer<typeof DesignConfigSchema>;
export type AnalyticsConfig = z.infer<typeof AnalyticsConfigSchema>;
export type ChatbotConfig = z.infer<typeof ChatbotConfigSchema>;
export type ContactFormConfig = z.infer<typeof ContactFormConfigSchema>;
export type SeoConfig = z.infer<typeof SeoConfigSchema>;
export type CvVariantConfig = z.infer<typeof CvVariantConfigSchema>;
export type CvConfig = z.infer<typeof CvConfigSchema>;
export type AwsConfig = z.infer<typeof AwsConfigSchema>;
export type BuildConfig = z.infer<typeof BuildConfigSchema>;
export type HeroLampAnimation = z.infer<typeof HeroLampAnimationSchema>;
export type HeroLampAnchor = z.infer<typeof HeroLampAnchorSchema>;
export type HeroLampPaletteMode = z.infer<typeof HeroLampPaletteModeSchema>;
export type HeroLampPalette = z.infer<typeof HeroLampPaletteSchema>;
export type HeroLampConfig = z.infer<typeof HeroLampConfigSchema>;
export type HeroPhotoRelightProfile = z.infer<typeof HeroPhotoRelightProfileSchema>;
export type HeroPhotoRelightTone = z.infer<typeof HeroPhotoRelightToneSchema>;
export type HeroPhotoRelightConfig = z.infer<typeof HeroPhotoRelightConfigSchema>;
export type HeroTextBlockConfig = z.infer<typeof HeroTextBlockConfigSchema>;
export type HeroConfig = z.infer<typeof HeroConfigSchema>;
export type PortfolioConfig = z.infer<typeof PortfolioConfigSchema>;
