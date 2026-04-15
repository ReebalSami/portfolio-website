export { ThemeWrapper } from "./theme-wrapper";
export { PortfolioGalleryTheme } from "./portfolio-gallery";

import type { CvData } from "@/lib/cv/schema";

type Locale = "en" | "de" | "es" | "ar";

export interface CvThemeComponentProps {
  data: CvData;
  locale: Locale;
  printMode?: boolean;
}
