export { ThemeWrapper } from "./theme-wrapper";
export { CanvaElegantTheme } from "./canva-elegant";
export { PortfolioGalleryTheme } from "./portfolio-gallery";
export { PortfolioPdfTheme } from "./portfolio-pdf";
export { HybridBlendTheme } from "./hybrid-blend";
export { SoulfulTheme } from "./soulful";

import type { CvData } from "@/lib/cv/schema";
import { CanvaElegantTheme } from "./canva-elegant";
import { PortfolioPdfTheme } from "./portfolio-pdf";
import { HybridBlendTheme } from "./hybrid-blend";
import { SoulfulTheme } from "./soulful";

type Locale = "en" | "de" | "es" | "ar";

export interface CvThemeComponentProps {
  data: CvData;
  locale: Locale;
  printMode?: boolean;
}

type CvThemeComponent = (
  props: CvThemeComponentProps,
) => React.ReactNode | Promise<React.ReactNode>;

const themeComponents: Record<string, CvThemeComponent> = {
  "canva-elegant": CanvaElegantTheme,
  "portfolio-gallery": PortfolioPdfTheme,
  "hybrid-blend": HybridBlendTheme,
  soulful: SoulfulTheme,
};

export function getThemeComponent(themeId: string): CvThemeComponent {
  const component = themeComponents[themeId];
  if (!component) {
    const available = Object.keys(themeComponents).join(", ");
    throw new Error(
      `CV theme component "${themeId}" not found. Available: ${available}`
    );
  }
  return component;
}

export function renderCvTheme(
  themeId: string,
  props: CvThemeComponentProps,
): React.ReactNode | Promise<React.ReactNode> {
  const Component = getThemeComponent(themeId);
  return Component(props);
}
