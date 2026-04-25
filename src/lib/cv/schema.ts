import { z } from "zod/v4";

// =============================================================================
// CV Data Schema — Single Source of Truth for all career data
// =============================================================================
// Follows JSON Resume field names where applicable.
// Inline i18n: every user-facing text field supports locale maps.
// Private/public separation via visibility field + separate YAML files.
// =============================================================================

// --- Locale String (inline i18n) ---

export const CvLocaleStringSchema = z.object({
  en: z.string(),
  de: z.string(),
  es: z.string().optional(),
  ar: z.string().optional(),
});

// --- Meta ---

export const CvMetaSchema = z.object({
  version: z.string(),
  lastUpdated: z.string(),
  defaultLocale: z.string().default("en"),
});

// --- Basics ---

export const CvLocationSchema = z.object({
  city: CvLocaleStringSchema,
  country: CvLocaleStringSchema,
  address: z.string().optional(),
  postalCode: z.string().optional(),
});

export const CvBasicsSchema = z.object({
  name: z.string(),
  title: CvLocaleStringSchema,
  email: z.email(),
  phone: z.string().optional(),
  url: z.url().optional(),
  location: CvLocationSchema,
  photo: z.string().optional(),
  profiles: z.array(
    z.object({
      network: z.string(),
      url: z.url(),
      username: z.string().optional(),
    })
  ),
});

// --- Profile / Summary ---

export const CvProfileSchema = z.object({
  summary: CvLocaleStringSchema,
});

// --- Experience ---

export const CvExperienceSchema = z.object({
  company: z.string(),
  position: CvLocaleStringSchema,
  location: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  description: CvLocaleStringSchema.optional(),
  highlights: z.array(CvLocaleStringSchema).optional(),
  tags: z.array(z.string()).optional(),
  visibility: z.enum(["public", "private", "extended"]).default("public"),
});

// --- Education ---

export const CvEducationSchema = z.object({
  institution: z.string(),
  area: CvLocaleStringSchema,
  studyType: CvLocaleStringSchema,
  location: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  grade: z.string().optional(),
  description: CvLocaleStringSchema.optional(),
  highlights: z.array(CvLocaleStringSchema).optional(),
  visibility: z.enum(["public", "private", "extended"]).default("public"),
});

// --- Projects ---

export const CvProjectSchema = z.object({
  name: z.string(),
  context: CvLocaleStringSchema.optional(),
  date: z.string().optional(),
  description: CvLocaleStringSchema,
  url: z.url().optional(),
  highlights: z.array(CvLocaleStringSchema).optional(),
  tags: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  visibility: z.enum(["public", "private", "extended"]).default("public"),
});

// --- Skills ---

export const CvSkillSchema = z.object({
  name: z.string(),
  level: z.string().optional(),
});

export const CvSkillCategorySchema = z.object({
  category: CvLocaleStringSchema,
  skills: z.array(CvSkillSchema),
});

// --- Languages ---

export const CvLanguageSchema = z.object({
  language: CvLocaleStringSchema,
  fluency: CvLocaleStringSchema,
  certification: z.string().optional(),
});

// --- Certifications ---

export const CvCertificationSchema = z.object({
  name: z.string(),
  issuer: z.string(),
  date: z.string(),
  url: z.url().optional(),
});

// --- References ---

export const CvReferenceSchema = z.object({
  name: z.string(),
  position: z.string(),
  company: z.string(),
  relation: CvLocaleStringSchema.optional(),
  phone: z.string().optional(),
  email: z.email().optional(),
  visibility: z.enum(["public", "private", "extended"]).default("extended"),
});

// --- Soft Skills ---

export const CvSoftSkillsSchema = CvLocaleStringSchema.extend({
  en: z.array(z.string()),
  de: z.array(z.string()),
  es: z.array(z.string()).optional(),
  ar: z.array(z.string()).optional(),
});

// --- Interests ---

export const CvInterestSchema = z.object({
  name: CvLocaleStringSchema,
  keywords: z.array(CvLocaleStringSchema).optional(),
});

// --- Thank-You Closing (Visual CV only) ---

export const CvThankYouSchema = z.object({
  greeting: CvLocaleStringSchema,
  message: CvLocaleStringSchema,
});

// =============================================================================
// Top-level CV Data Schema
// =============================================================================

export const CvDataSchema = z.object({
  meta: CvMetaSchema,
  basics: CvBasicsSchema,
  profile: CvProfileSchema,
  experience: z.array(CvExperienceSchema),
  education: z.array(CvEducationSchema),
  projects: z.array(CvProjectSchema).optional(),
  skills: z.array(CvSkillCategorySchema),
  languages: z.array(CvLanguageSchema),
  certifications: z.array(CvCertificationSchema).optional(),
  references: z.array(CvReferenceSchema).optional(),
  softSkills: CvSoftSkillsSchema.optional(),
  interests: z.array(CvInterestSchema).optional(),
  thankYou: CvThankYouSchema.optional(),
});

// =============================================================================
// Private overlay schema (partial — only fields that appear in private YAML)
// =============================================================================

export const CvPrivateOverlaySchema = z.object({
  basics: z
    .object({
      email_personal: z.email().optional(),
      phone: z.string().optional(),
      location: z
        .object({
          address: z.string().optional(),
          postalCode: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
  references: z.array(CvReferenceSchema).optional(),
});

// =============================================================================
// Inferred TypeScript types
// =============================================================================

export type CvLocaleString = z.infer<typeof CvLocaleStringSchema>;
export type CvMeta = z.infer<typeof CvMetaSchema>;
export type CvBasics = z.infer<typeof CvBasicsSchema>;
export type CvProfile = z.infer<typeof CvProfileSchema>;
export type CvExperience = z.infer<typeof CvExperienceSchema>;
export type CvEducation = z.infer<typeof CvEducationSchema>;
export type CvProject = z.infer<typeof CvProjectSchema>;
export type CvSkill = z.infer<typeof CvSkillSchema>;
export type CvSkillCategory = z.infer<typeof CvSkillCategorySchema>;
export type CvLanguage = z.infer<typeof CvLanguageSchema>;
export type CvCertification = z.infer<typeof CvCertificationSchema>;
export type CvReference = z.infer<typeof CvReferenceSchema>;
export type CvSoftSkills = z.infer<typeof CvSoftSkillsSchema>;
export type CvInterest = z.infer<typeof CvInterestSchema>;
export type CvThankYou = z.infer<typeof CvThankYouSchema>;
export type CvData = z.infer<typeof CvDataSchema>;
export type CvPrivateOverlay = z.infer<typeof CvPrivateOverlaySchema>;
export type CvLocation = z.infer<typeof CvLocationSchema>;
