import { Playfair_Display, Fraunces, DM_Sans } from "next/font/google";

// =============================================================================
// CV Theme Fonts — loaded on-demand per theme
// =============================================================================
// Browser only downloads fonts whose CSS classes appear in the DOM.
// Each theme imports only the fonts it needs from here.
// =============================================================================

export const playfairDisplay = Playfair_Display({
  variable: "--font-cv-heading-serif",
  subsets: ["latin"],
  display: "swap",
});

export const fraunces = Fraunces({
  variable: "--font-cv-heading-warm",
  subsets: ["latin"],
  display: "swap",
});

export const dmSans = DM_Sans({
  variable: "--font-cv-body-warm",
  subsets: ["latin"],
  display: "swap",
});
