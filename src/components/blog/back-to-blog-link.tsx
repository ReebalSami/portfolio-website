"use client";

import { useTranslations } from "next-intl";
import { TransitionLink } from "@/components/shared/transition-link";
import { cn } from "@/lib/utils";

/**
 * "Back to blog" link rendered above the article header AND below the
 * article footer on every blog post. Visual treatment matches the
 * "Full résumé →" link inside `<CompactJourney>` (small uppercase heading
 * font, bottom-border underline, animated arrow on hover) so the editorial
 * voice stays consistent across the homepage timeline and blog post chrome.
 *
 * Forward arrow vs back arrow:
 *   - Journey link points forward (`→`) and slides right on hover.
 *   - Back-to-blog link points back (`←`) and slides left on hover.
 *   - Both are mirrored in RTL via `rtl:rotate-180`.
 *
 * Locale handling: `next-intl`'s `useTranslations` resolves `"blog.backToBlog"`,
 * which is supplied for all four locales (`en`, `de`, `es`, `ar`).
 *
 * The `data-component` attribute is exposed for E2E tests so they can assert
 * against the link without coupling to the (translated) text or class list.
 */
export function BackToBlogLink({ className }: { className?: string }) {
  const t = useTranslations("blog");

  return (
    <TransitionLink
      href="/#blog"
      data-component="back-to-blog"
      className={cn(
        "group inline-flex items-baseline gap-1.5 text-xs font-heading uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="rtl:rotate-180 transition-transform group-hover:-translate-x-0.5 motion-reduce:group-hover:translate-x-0"
      >
        ←
      </span>
      <span className="border-b border-foreground/40 pb-0.5 transition-colors group-hover:border-[var(--accent-warm-fg)]">
        {t("backToBlog")}
      </span>
    </TransitionLink>
  );
}
