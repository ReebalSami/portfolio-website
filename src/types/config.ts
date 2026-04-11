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
});

export const PhotosConfigSchema = z.object({
  hero: z.string(),
  heroDir: z.string(),
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
  recipientEmail: z.email(),
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

export const CvThemeConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const CvPhotosConfigSchema = z.object({
  canvaElegant: z.string(),
  portfolioGallery: z.string(),
  hybridBlend: z.string(),
});

export const CvConfigSchema = z.object({
  defaultTheme: z.string(),
  themes: z.array(CvThemeConfigSchema),
  defaultVariant: z.string(),
  showThemeSwitcher: z.boolean(),
  showLanguageSwitcher: z.boolean(),
  photos: CvPhotosConfigSchema,
});

export const BuildConfigSchema = z.object({
  outputDir: z.string(),
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
});

export type SiteConfig = z.infer<typeof SiteConfigSchema>;
export type ContactConfig = z.infer<typeof ContactConfigSchema>;
export type SocialConfig = z.infer<typeof SocialConfigSchema>;
export type I18nConfig = z.infer<typeof I18nConfigSchema>;
export type FeaturesConfig = z.infer<typeof FeaturesConfigSchema>;
export type PhotosConfig = z.infer<typeof PhotosConfigSchema>;
export type DesignConfig = z.infer<typeof DesignConfigSchema>;
export type AnalyticsConfig = z.infer<typeof AnalyticsConfigSchema>;
export type ChatbotConfig = z.infer<typeof ChatbotConfigSchema>;
export type ContactFormConfig = z.infer<typeof ContactFormConfigSchema>;
export type SeoConfig = z.infer<typeof SeoConfigSchema>;
export type CvThemeConfig = z.infer<typeof CvThemeConfigSchema>;
export type CvPhotosConfig = z.infer<typeof CvPhotosConfigSchema>;
export type CvConfig = z.infer<typeof CvConfigSchema>;
export type AwsConfig = z.infer<typeof AwsConfigSchema>;
export type BuildConfig = z.infer<typeof BuildConfigSchema>;
export type PortfolioConfig = z.infer<typeof PortfolioConfigSchema>;
