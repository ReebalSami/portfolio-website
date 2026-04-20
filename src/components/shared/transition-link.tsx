"use client";

import { forwardRef, type ComponentProps, type MouseEvent } from "react";
import { Link as IntlLink } from "@/i18n/navigation";
import { useTransitionRouter } from "next-view-transitions";

type Props = ComponentProps<typeof IntlLink>;

/**
 * Locale-aware Link that triggers a CSS View Transition on click.
 *
 * Composes `next-intl`'s `Link` (for type-safe, locale-prefixed hrefs) with
 * `next-view-transitions`' `useTransitionRouter` (to wrap the navigation in
 * `document.startViewTransition`). The rendered <a> still points at the
 * resolved locale-prefixed URL, so:
 *   - SEO / crawlers still see real URLs
 *   - ctrl/cmd/middle click -> new tab (default browser behaviour, no transition)
 *   - primary click -> view transition then client-side push
 *
 * Browsers without View Transitions API fall back to a normal client-side
 * navigation — the rendered <a> is unchanged.
 */
export const TransitionLink = forwardRef<HTMLAnchorElement, Props>(
  function TransitionLink({ onClick, ...props }, ref) {
    const router = useTransitionRouter();

    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(event);

      if (event.defaultPrevented) return;
      if (event.button !== 0) return; // only primary click
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.currentTarget;
      // Respect explicit target (new tab / named frame)
      if (target.target && target.target !== "_self") return;

      const href = target.getAttribute("href");
      if (!href) return;

      event.preventDefault();
      router.push(href);
    };

    return <IntlLink {...props} ref={ref} onClick={handleClick} />;
  }
);
