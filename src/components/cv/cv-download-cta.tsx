"use client";

import type { ReactNode } from "react";

interface CvDownloadCtaProps {
  children: ReactNode;
  className?: string;
  /** Plausible event slug. Defaults to "cv:download-open". */
  plausibleEvent?: string;
  /** Plausible "source" prop to identify which placement opened the panel. */
  source?: "hero" | "footer" | "inline";
  /** Aria label override. Defaults to "Open download options". */
  ariaLabel?: string;
}

/**
 * Reusable CTA that asks the page-level <CvDownloadFab /> to open its panel.
 *
 * Communication is via a `cv-fab:open` window CustomEvent, dispatched here
 * and listened to inside <CvDownloadFab />. Using DOM events instead of a
 * shared React context keeps both sides decoupled — the CTA can live deep
 * in any server component tree without provider plumbing, and the FAB can
 * be the only client subscriber on the page.
 */
export function CvDownloadCta({
  children,
  className,
  plausibleEvent = "cv:download-open",
  source = "inline",
  ariaLabel = "Open download options",
}: CvDownloadCtaProps) {
  return (
    <button
      type="button"
      onClick={() => {
        window.dispatchEvent(new CustomEvent("cv-fab:open"));
      }}
      className={className}
      aria-label={ariaLabel}
      data-plausible-event={plausibleEvent}
      data-plausible-event-source={source}
    >
      {children}
    </button>
  );
}
