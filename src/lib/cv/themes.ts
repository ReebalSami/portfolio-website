import { getConfig } from "@/lib/config";

// =============================================================================
// CV Theme Registry — design tokens and configuration for each CV theme
// =============================================================================

export interface CvThemeFonts {
  heading: string;
  body: string;
  mono: string;
}

export interface CvThemeColors {
  primary: string;
  accent: string;
  background: string;
  sidebar: string;
  text: string;
  muted: string;
}

export interface CvThemeDarkColors {
  primary: string;
  accent: string;
  background: string;
  sidebar: string;
  text: string;
  muted: string;
}

export interface CvThemeSpacing {
  sectionGap: string;
  itemGap: string;
  sidebarWidth: string;
}

export interface CvThemeFeatures {
  photo: boolean;
  icons: boolean;
  darkMode: boolean;
  sidebar: boolean;
}

export interface CvThemeCssVars {
  "--cv-bg": string;
  "--cv-sidebar-bg": string;
  "--cv-text": string;
  "--cv-heading": string;
  "--cv-accent": string;
  "--cv-muted": string;
  "--cv-border": string;
  "--cv-font-heading": string;
  "--cv-font-body": string;
  "--cv-spacing-section": string;
  "--cv-spacing-item": string;
  [key: `--${string}`]: string;
}

export interface CvTheme {
  id: string;
  name: string;
  description: string;
  fonts: CvThemeFonts;
  colors: CvThemeColors;
  darkColors?: CvThemeDarkColors;
  spacing: CvThemeSpacing;
  features: CvThemeFeatures;
  cssVars: CvThemeCssVars;
  darkCssVars?: Partial<CvThemeCssVars>;
  printCssVars?: Partial<CvThemeCssVars>;
  headingStyle?: React.CSSProperties;
  photoShape: "round" | "square" | "rounded" | "oval";
}

// =============================================================================
// Theme definitions
// =============================================================================

const themes: Record<string, CvTheme> = {
  "canva-elegant": {
    id: "canva-elegant",
    name: "Canva Elegant",
    description:
      "Classic two-column layout with warm beige sidebar, serif headings, and wide letter-spacing",
    fonts: {
      heading: "Playfair Display",
      body: "Space Grotesk",
      mono: "JetBrains Mono",
    },
    colors: {
      primary: "oklch(0.20 0.01 260)",
      accent: "oklch(0.94 0.02 70)",
      background: "oklch(1.0 0 0)",
      sidebar: "oklch(0.94 0.02 70)",
      text: "oklch(0.20 0.01 260)",
      muted: "oklch(0.55 0.01 260)",
    },
    spacing: {
      sectionGap: "1.5rem",
      itemGap: "0.75rem",
      sidebarWidth: "35%",
    },
    features: {
      photo: true,
      icons: true,
      darkMode: false,
      sidebar: true,
    },
    cssVars: {
      "--cv-bg": "oklch(1.0 0 0)",
      "--cv-sidebar-bg": "oklch(0.94 0.02 70)",
      "--cv-text": "oklch(0.20 0.01 260)",
      "--cv-heading": "oklch(0.15 0.01 260)",
      "--cv-accent": "oklch(0.75 0.06 55)",
      "--cv-muted": "oklch(0.55 0.01 260)",
      "--cv-border": "oklch(0.85 0.02 70)",
      "--cv-font-heading": "var(--font-cv-heading-serif), 'Playfair Display', serif",
      "--cv-font-body": "var(--font-sans), 'Space Grotesk', sans-serif",
      "--cv-spacing-section": "1.5rem",
      "--cv-spacing-item": "0.75rem",
    },
    printCssVars: {
      "--cv-sidebar-bg": "oklch(0.96 0.005 90)",
    },
    headingStyle: {
      textTransform: "uppercase" as const,
      letterSpacing: "0.25em",
      fontWeight: 400,
    },
    photoShape: "round",
  },

  "portfolio-gallery": {
    id: "portfolio-gallery",
    name: "Portfolio Gallery",
    description:
      "Matches reebal-sami.com — NFT Art Gallery aesthetic with Archivo headings and gallery-warm accent",
    fonts: {
      heading: "Archivo",
      body: "Space Grotesk",
      mono: "JetBrains Mono",
    },
    colors: {
      primary: "oklch(0.14 0.005 285.82)",
      accent: "oklch(0.82 0.08 55)",
      background: "oklch(0.99 0.005 106)",
      sidebar: "oklch(0.97 0.005 106)",
      text: "oklch(0.14 0.005 285.82)",
      muted: "oklch(0.55 0.01 260)",
    },
    darkColors: {
      primary: "oklch(0.96 0.002 90)",
      accent: "oklch(0.72 0.08 55)",
      background: "oklch(0.13 0.005 285)",
      sidebar: "oklch(0.16 0.005 285)",
      text: "oklch(0.96 0.002 90)",
      muted: "oklch(0.65 0.005 285)",
    },
    spacing: {
      sectionGap: "2rem",
      itemGap: "1rem",
      sidebarWidth: "30%",
    },
    features: {
      photo: true,
      icons: false,
      darkMode: true,
      sidebar: true,
    },
    cssVars: {
      "--cv-bg": "oklch(0.99 0.005 106)",
      "--cv-sidebar-bg": "oklch(0.97 0.005 106)",
      "--cv-text": "oklch(0.14 0.005 285.82)",
      "--cv-heading": "oklch(0.14 0.005 285.82)",
      "--cv-accent": "oklch(0.82 0.08 55)",
      "--cv-muted": "oklch(0.55 0.01 260)",
      "--cv-border": "oklch(0.91 0.004 90)",
      "--cv-font-heading": "var(--font-heading), 'Archivo', sans-serif",
      "--cv-font-body": "var(--font-sans), 'Space Grotesk', sans-serif",
      "--cv-spacing-section": "2rem",
      "--cv-spacing-item": "1rem",
    },
    darkCssVars: {
      "--cv-bg": "oklch(0.13 0.005 285)",
      "--cv-sidebar-bg": "oklch(0.16 0.005 285)",
      "--cv-text": "oklch(0.96 0.002 90)",
      "--cv-heading": "oklch(0.96 0.002 90)",
      "--cv-accent": "oklch(0.72 0.08 55)",
      "--cv-muted": "oklch(0.65 0.005 285)",
      "--cv-border": "oklch(1 0 0 / 12%)",
    },
    headingStyle: {
      textTransform: "uppercase" as const,
      letterSpacing: "-0.02em",
      fontWeight: 700,
    },
    photoShape: "square",
  },

  "hybrid-blend": {
    id: "hybrid-blend",
    name: "Hybrid Blend",
    description:
      "Best of both — Canva warm tones with portfolio modern typography and card-based layout",
    fonts: {
      heading: "Archivo",
      body: "Space Grotesk",
      mono: "JetBrains Mono",
    },
    colors: {
      primary: "oklch(0.20 0.01 260)",
      accent: "oklch(0.82 0.08 55)",
      background: "oklch(1.0 0 0)",
      sidebar: "oklch(0.94 0.02 70)",
      text: "oklch(0.20 0.01 260)",
      muted: "oklch(0.55 0.01 260)",
    },
    darkColors: {
      primary: "oklch(0.96 0.002 90)",
      accent: "oklch(0.72 0.08 55)",
      background: "oklch(0.13 0.005 285)",
      sidebar: "oklch(0.18 0.005 285)",
      text: "oklch(0.96 0.002 90)",
      muted: "oklch(0.65 0.005 285)",
    },
    spacing: {
      sectionGap: "1.75rem",
      itemGap: "0.875rem",
      sidebarWidth: "38%",
    },
    features: {
      photo: true,
      icons: true,
      darkMode: true,
      sidebar: true,
    },
    cssVars: {
      "--cv-bg": "oklch(1.0 0 0)",
      "--cv-sidebar-bg": "oklch(0.94 0.02 70)",
      "--cv-text": "oklch(0.20 0.01 260)",
      "--cv-heading": "oklch(0.15 0.01 260)",
      "--cv-accent": "oklch(0.82 0.08 55)",
      "--cv-muted": "oklch(0.55 0.01 260)",
      "--cv-border": "oklch(0.88 0.02 70)",
      "--cv-font-heading": "var(--font-heading), 'Archivo', sans-serif",
      "--cv-font-body": "var(--font-sans), 'Space Grotesk', sans-serif",
      "--cv-spacing-section": "1.75rem",
      "--cv-spacing-item": "0.875rem",
    },
    darkCssVars: {
      "--cv-bg": "oklch(0.13 0.005 285)",
      "--cv-sidebar-bg": "oklch(0.18 0.005 285)",
      "--cv-text": "oklch(0.96 0.002 90)",
      "--cv-heading": "oklch(0.96 0.002 90)",
      "--cv-accent": "oklch(0.72 0.08 55)",
      "--cv-muted": "oklch(0.65 0.005 285)",
      "--cv-border": "oklch(1 0 0 / 12%)",
    },
    headingStyle: {
      textTransform: "uppercase" as const,
      letterSpacing: "0.15em",
      fontWeight: 600,
    },
    photoShape: "rounded",
  },

  soulful: {
    id: "soulful",
    name: "Soulful",
    description:
      "Psychologically optimized — F-pattern layout, golden ratio sidebar, warm gold accents on charcoal",
    fonts: {
      heading: "Fraunces",
      body: "DM Sans",
      mono: "JetBrains Mono",
    },
    colors: {
      primary: "oklch(0.20 0.01 260)",
      accent: "oklch(0.78 0.12 75)",
      background: "oklch(1.0 0 0)",
      sidebar: "oklch(0.97 0.01 90)",
      text: "oklch(0.20 0.01 260)",
      muted: "oklch(0.50 0.01 260)",
    },
    spacing: {
      sectionGap: "1.5rem",
      itemGap: "0.75rem",
      sidebarWidth: "38.2%",
    },
    features: {
      photo: true,
      icons: true,
      darkMode: false,
      sidebar: true,
    },
    cssVars: {
      "--cv-bg": "oklch(1.0 0 0)",
      "--cv-sidebar-bg": "oklch(0.97 0.01 90)",
      "--cv-text": "oklch(0.20 0.01 260)",
      "--cv-heading": "oklch(0.15 0.01 260)",
      "--cv-accent": "oklch(0.78 0.12 75)",
      "--cv-muted": "oklch(0.50 0.01 260)",
      "--cv-border": "oklch(0.90 0.01 75)",
      "--cv-font-heading": "var(--font-cv-heading-warm), 'Fraunces', serif",
      "--cv-font-body": "var(--font-cv-body-warm), 'DM Sans', sans-serif",
      "--cv-spacing-section": "1.5rem",
      "--cv-spacing-item": "0.75rem",
    },
    printCssVars: {
      "--cv-sidebar-bg": "oklch(0.97 0.005 90)",
    },
    headingStyle: {
      fontWeight: 500,
      letterSpacing: "0.02em",
    },
    photoShape: "oval",
  },
};

/**
 * Get a theme by ID. Throws if theme is not found.
 */
export function getTheme(id: string): CvTheme {
  const theme = themes[id];
  if (!theme) {
    const available = Object.keys(themes).join(", ");
    throw new Error(
      `CV theme "${id}" not found. Available themes: ${available}`
    );
  }
  return theme;
}

/**
 * Get the default theme (first registered theme).
 */
export function getDefaultTheme(): CvTheme {
  return Object.values(themes)[0];
}

/**
 * Get all available themes.
 */
export function getAllThemes(): CvTheme[] {
  return Object.values(themes);
}

/**
 * Get CV variant IDs from site.yaml config.
 */
export function getConfiguredVariantIds(): string[] {
  const config = getConfig();
  return config.cv.variants.map((v) => v.id);
}
