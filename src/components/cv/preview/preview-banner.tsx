import Link from "next/link";
import { ChevronLeft, Eye } from "lucide-react";
import type { CvPreviewVariant } from "./variants";

interface PreviewBannerProps {
  variant: CvPreviewVariant;
  locale: string;
}

/**
 * Fixed top-center pill banner shown on every /cv/option-N preview.
 * Hidden on print. Links back to the picker. `print:hidden`.
 */
export function PreviewBanner({ variant, locale }: PreviewBannerProps) {
  const pickerHref = `/${locale}/cv/preview`;

  return (
    <div
      role="status"
      aria-label={`Preview: ${variant.name}`}
      className="fixed inset-x-0 top-3 z-[60] flex justify-center px-3 print:hidden"
    >
      <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-border/70 bg-background/85 px-3 py-1.5 text-xs shadow-lg shadow-black/5 backdrop-blur-md sm:gap-3 sm:px-4 sm:text-sm">
        <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
          <Eye className="h-3.5 w-3.5 text-gallery-warm" aria-hidden="true" />
          Preview
        </span>
        <span className="hidden text-muted-foreground sm:inline">·</span>
        <span className="font-medium tracking-tight text-foreground">
          {variant.name}
        </span>
        <span className="text-muted-foreground">·</span>
        <Link
          href={pickerHref}
          className="inline-flex items-center gap-1 font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to picker
        </Link>
      </div>
    </div>
  );
}
