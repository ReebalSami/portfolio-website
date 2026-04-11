import { getConfig } from "@/lib/config";

// =============================================================================
// CV Theme Registry — design tokens and configuration for each CV theme
// =============================================================================
// Full theme implementations (component styling, layout) come in Skill 19.
// This file defines the theme type, design tokens, and registry helpers.
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

export interface CvTheme {
  id: string;
  name: string;
  description: string;
  fonts: CvThemeFonts;
  colors: CvThemeColors;
  spacing: CvThemeSpacing;
  features: CvThemeFeatures;
}

// =============================================================================
// Theme definitions — design tokens only (visual implementation in Skill 19)
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
 * Get the default theme as configured in site.yaml.
 */
export function getDefaultTheme(): CvTheme {
  const config = getConfig();
  return getTheme(config.cv.defaultTheme);
}

/**
 * Get all available themes.
 */
export function getAllThemes(): CvTheme[] {
  return Object.values(themes);
}

/**
 * Get theme IDs registered in site.yaml config.
 */
export function getConfiguredThemeIds(): string[] {
  const config = getConfig();
  return config.cv.themes.map((t) => t.id);
}
