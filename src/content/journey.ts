/**
 * Journey — condensed homepage narrative arc (M7).
 *
 * Why this file exists:
 *   The existing `src/content/timeline.ts` is a long-form vertical timeline
 *   with expandable bullet lists, rendered by `TimelineEntryCard` inside
 *   `AboutSection`. It does its job, but it is too dense for a cinematic
 *   horizontal carousel on the homepage. This file is the *compact* narrative
 *   — one chapter per stage, one tagline, a handful of keywords. Full
 *   bullet lists stay on `/cv` (sourced from `config/cv/*.yaml`).
 *
 * i18n strategy:
 *   - `chapter` and `tagline` carry a locale map `{ en, de, es, ar }`.
 *     These are narrative / creative copy so they MUST feel native.
 *   - `role`, `org`, `place`, `keywords` are English-only. This matches
 *     universal CV convention: job titles and company names do not
 *     translate on a résumé, and keyword chips (React, Next.js, GraphRAG …)
 *     are technical terms recognised across locales.
 *   - Latin-script city names render LTR inside an RTL sentence naturally.
 *
 * Ordering: chronological ASC (earliest first). `CompactJourney` reverses
 * this to newest-first at render time if desired; keeping the source in
 * real time order makes it easier to reason about.
 */

export type JourneyLocale = "en" | "de" | "es" | "ar";

export type JourneyLocaleMap = Record<JourneyLocale, string>;

export interface JourneyEntry {
  /** Stable slug used as React key + analytics label. */
  id: string;
  /** Single-year label shown on inactive / adjacent cards. */
  year: string;
  /** Full range label shown on the active card ("2016 — 2022"). */
  yearRange: string;
  /** Job title / degree. English-only (CV convention). */
  role: string;
  /** Organisation / institution name. English-only. */
  org: string;
  /** City (+ optional country). Latin-script; renders correctly inside RTL. */
  place: string;
  /** Tech / domain keyword chips, technical terms shared across locales. */
  keywords: readonly string[];
  /** Narrative chapter label. Translated per locale. */
  chapter: JourneyLocaleMap;
  /** One-line editorial tagline. Translated per locale. */
  tagline: JourneyLocaleMap;
  /** Marks the current "present" role; used for default-focused entry. */
  active?: boolean;
}

export const journeyEntries: readonly JourneyEntry[] = [
  {
    id: "albaraka",
    year: "2014",
    yearRange: "2014 — 2015",
    role: "Trade Relations Specialist",
    org: "alBaraka Bank",
    place: "Damascus, Syria",
    keywords: ["Corporate Banking", "Letters of Credit", "VIP Clients"],
    chapter: {
      en: "Origin",
      de: "Ursprung",
      es: "Origen",
      ar: "النشأة",
    },
    tagline: {
      en: "Corporate banking. International letters of credit.",
      de: "Firmenkundengeschäft. Internationale Akkreditive.",
      es: "Banca corporativa. Cartas de crédito internacionales.",
      ar: "خدمات مصرفية للشركات واعتمادات مستندية دولية.",
    },
  },
  {
    id: "otto",
    year: "2016",
    yearRange: "2016 — 2022",
    role: "Financial Accountant",
    org: "Otto Group",
    place: "Hamburg",
    keywords: ["SAP FI-CO", "UiPath RPA", "IFRS / HGB"],
    chapter: {
      en: "Foundation",
      de: "Grundstein",
      es: "Fundamento",
      ar: "الأسس",
    },
    tagline: {
      en: "Five years inside enterprise finance. Led RPA initiatives.",
      de: "Fünf Jahre Konzernfinanzen. RPA-Initiativen vorangetrieben.",
      es: "Cinco años en finanzas corporativas. Lideré iniciativas de RPA.",
      ar: "خمس سنوات في التمويل المؤسسي مع قيادة مبادرات الأتمتة.",
    },
  },
  {
    id: "neuefische-ds",
    year: "2022",
    yearRange: "2022 — 2023",
    role: "Data Science Trainee",
    org: "neuefische GmbH",
    place: "Hamburg",
    keywords: ["Python", "Machine Learning", "Recommender Systems"],
    chapter: {
      en: "Pivot",
      de: "Wendepunkt",
      es: "Viraje",
      ar: "التحول",
    },
    tagline: {
      en: "Pivot into AI. Multi-objective recommender on GCP.",
      de: "Wechsel in die KI. Multi-Objective-Recommender auf GCP.",
      es: "Viraje hacia la IA. Recomendador multi-objetivo en GCP.",
      ar: "تحوّل إلى الذكاء الاصطناعي: نظام توصيات متعدد الأهداف على GCP.",
    },
  },
  {
    id: "neuefische-fs",
    year: "2024",
    yearRange: "2024",
    role: "Full-Stack Java Trainee",
    org: "neuefische GmbH",
    place: "Hamburg",
    keywords: ["Spring Boot", "React", "MongoDB"],
    chapter: {
      en: "Build",
      de: "Aufbau",
      es: "Construcción",
      ar: "البناء",
    },
    tagline: {
      en: "MyRecipes — AI-powered web app, end to end.",
      de: "MyRecipes – KI-Web-App, Ende zu Ende.",
      es: "MyRecipes — app web con IA, de principio a fin.",
      ar: "MyRecipes — تطبيق ويب مدعوم بالذكاء الاصطناعي، من الفكرة إلى الإطلاق.",
    },
  },
  {
    id: "fhwedel",
    year: "2024",
    yearRange: "2024 — present",
    role: "M.Sc. Data Science & AI",
    org: "FH Wedel",
    place: "Wedel, Germany",
    keywords: ["GraphRAG", "Document Intelligence", "Deep Learning"],
    chapter: {
      en: "Depth",
      de: "Tiefe",
      es: "Profundidad",
      ar: "التعمق",
    },
    tagline: {
      en: "Thesis: OCR-free extraction · knowledge graphs · local LLMs.",
      de: "Masterarbeit: OCR-freie Extraktion · Wissensgraphen · lokale LLMs.",
      es: "Tesis: extracción sin OCR · grafos de conocimiento · LLMs locales.",
      ar: "أطروحة الماجستير: استخراج بدون OCR ورسوم بيانية للمعرفة ونماذج LLM محلية.",
    },
    active: true,
  },
  {
    id: "datalogue",
    year: "2025",
    yearRange: "2025",
    role: "AI Working Student",
    org: "Datalogue",
    place: "Hamburg",
    keywords: ["Multi-Agent LLMs", "Async Pipelines", "Vector Search"],
    chapter: {
      en: "Now",
      de: "Heute",
      es: "Ahora",
      ar: "الحاضر",
    },
    tagline: {
      en: "B2B lead engine — concept to MVP. ~50 % manual work cut.",
      de: "B2B-Lead-Engine – Idee bis MVP. Rund 50 % Handarbeit eingespart.",
      es: "Motor de leads B2B — del concepto al MVP. ~50 % menos trabajo manual.",
      ar: "محرك لعملاء B2B محتملين — من الفكرة إلى MVP مع خفض العمل اليدوي بنحو 50٪.",
    },
  },
] as const;

/**
 * Resolve a locale-mapped string with graceful EN fallback.
 *
 * Mirrors the pattern used by `resolveCvLocaleString` in `src/lib/cv/data.ts`
 * but without the YAML/schema machinery — our journey data lives in
 * TypeScript so `JourneyLocaleMap` is already exhaustive.
 */
export function resolveJourneyString(
  map: JourneyLocaleMap,
  locale: JourneyLocale,
): string {
  return map[locale] ?? map.en;
}

/**
 * Pick the entry that should receive initial focus when the carousel
 * mounts. Editorial intent: land on the role flagged `active: true`
 * (the current "present" role) — typically the M.Sc. study programme.
 *
 * Fallback chain (in case the data ever ships without an `active: true`):
 *   1. The entry with the largest numeric `year`.
 *   2. Index 0 (defensive — should never be reached for valid data).
 *
 * Pure function — exported for unit testing and reuse.
 */
export function getDefaultActiveIndex(
  orderedEntries: readonly JourneyEntry[],
): number {
  const flagged = orderedEntries.findIndex((e) => e.active);
  if (flagged >= 0) return flagged;

  let bestIdx = 0;
  let bestYear = -Infinity;
  for (let i = 0; i < orderedEntries.length; i += 1) {
    const y = parseInt(orderedEntries[i].year, 10);
    if (Number.isFinite(y) && y > bestYear) {
      bestYear = y;
      bestIdx = i;
    }
  }
  return bestIdx;
}
