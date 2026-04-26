"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * About dropdown — desktop hover-to-open menu for the navigation bar.
 *
 * Three sub-items: Who · Journey · Tech. Clicking any item smooth-scrolls
 * to the matching anchor (`#who`, `#journey`, `#tech`) inside the
 * `#about` section. If the user is on a different page (e.g. `/cv`),
 * we navigate to `/#<anchor>` so the homepage loads with the right
 * subsection in view.
 *
 * Hover-to-open with a small close-delay so the cursor can travel from
 * trigger to menu without dropping the menu state. Also opens on focus
 * for keyboard users; ArrowDown moves focus into the menu, ArrowUp/Down
 * move between items, Escape closes.
 *
 * The component is purely visual + behavioural — it does NOT own the
 * "is this nav item active?" highlight logic. That stays in `navigation.tsx`
 * via `useActiveSection`. Here we just render the dropdown trigger and
 * its panel; active styling is passed in via `triggerClassName`.
 *
 * Accessibility: implements WAI-ARIA Menu pattern (role=menu, role=menuitem,
 * aria-haspopup, aria-expanded, focus management).
 */

export type AboutSubmenuItem = {
  id: "who" | "journey" | "tech";
  /** DOM anchor on the homepage. */
  anchor: string;
};

export const ABOUT_SUBMENU_ITEMS: ReadonlyArray<AboutSubmenuItem> = [
  { id: "who", anchor: "who" },
  { id: "journey", anchor: "journey" },
  { id: "tech", anchor: "tech" },
] as const;

interface AboutDropdownProps {
  /** Class for the trigger button wrapper. Active highlight comes from caller. */
  triggerClassName?: string;
  /** Aria-current value when the parent About section is active. */
  isParentActive?: boolean;
}

const HOVER_CLOSE_DELAY_MS = 140;

function isMainPage(pathname: string): boolean {
  return pathname === "/" || pathname === "";
}

export function AboutDropdown({ triggerClassName, isParentActive }: AboutDropdownProps) {
  const t = useTranslations("common.nav");
  const tSub = useTranslations("common.nav.aboutSubmenu");
  const router = useRouter();
  const pathname = usePathname();
  const onMain = isMainPage(pathname);
  const reducedMotion = useReducedMotion() ?? false;

  const [open, setOpen] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const [focusIndex, setFocusIndex] = useState<number>(-1);
  const menuId = useId();

  // Open with a tiny commit delay isn't needed; close has a delay so the
  // cursor can travel from trigger → menu without flicker.
  const cancelClose = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const openNow = () => {
    cancelClose();
    setOpen(true);
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false);
      setFocusIndex(-1);
    }, HOVER_CLOSE_DELAY_MS);
  };

  // Close when clicking outside.
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (
        target &&
        !triggerRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setOpen(false);
        setFocusIndex(-1);
      }
    };
    window.addEventListener("pointerdown", onPointer);
    return () => window.removeEventListener("pointerdown", onPointer);
  }, [open]);

  useEffect(() => {
    return () => cancelClose();
  }, []);

  // Move keyboard focus to the highlighted menu item.
  useEffect(() => {
    if (!open || focusIndex < 0) return;
    const items = menuRef.current?.querySelectorAll<HTMLAnchorElement>("[role='menuitem']");
    items?.[focusIndex]?.focus();
  }, [open, focusIndex]);

  const handleSelect = (anchor: string) => {
    setOpen(false);
    setFocusIndex(-1);
    if (onMain) {
      const el = document.getElementById(anchor);
      if (el) {
        el.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
      }
    } else {
      router.push(`/#${anchor}`);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) {
        openNow();
        setFocusIndex(0);
      } else {
        setFocusIndex((i) => Math.min(i + 1, ABOUT_SUBMENU_ITEMS.length - 1));
      }
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        openNow();
        setFocusIndex(ABOUT_SUBMENU_ITEMS.length - 1);
      } else {
        setFocusIndex((i) => Math.max(i - 1, 0));
      }
    } else if (event.key === "Escape") {
      if (open) {
        event.preventDefault();
        setOpen(false);
        setFocusIndex(-1);
        triggerRef.current?.focus();
      }
    } else if (event.key === "Home") {
      if (open) {
        event.preventDefault();
        setFocusIndex(0);
      }
    } else if (event.key === "End") {
      if (open) {
        event.preventDefault();
        setFocusIndex(ABOUT_SUBMENU_ITEMS.length - 1);
      }
    } else if (event.key === "Tab") {
      // Tabbing closes the dropdown — natural focus moves to the next nav item.
      setOpen(false);
      setFocusIndex(-1);
    }
  };

  // Top-level: clicking the trigger scrolls to (or navigates to) #about,
  // matching pre-dropdown behaviour for users who don't hover.
  const handleTriggerClick = () => {
    setOpen(false);
    setFocusIndex(-1);
    if (onMain) {
      const el = document.getElementById("about");
      if (el) {
        el.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
      }
    } else {
      router.push("/#about");
    }
  };

  return (
    <div
      className="relative"
      onMouseEnter={openNow}
      onMouseLeave={scheduleClose}
      onBlur={(e) => {
        // Only schedule close when focus leaves the entire dropdown.
        // We deliberately do NOT auto-open on focus — that would re-open
        // the menu the moment Escape's `triggerRef.current?.focus()` runs,
        // creating an infinite open/close ping-pong. Keyboard users open
        // the menu via ArrowDown / ArrowUp on the trigger (handled in
        // handleKeyDown), matching the WAI-ARIA Menu pattern.
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          scheduleClose();
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={handleTriggerClick}
        onKeyDown={handleKeyDown}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        className={triggerClassName}
        aria-current={isParentActive ? "page" : undefined}
      >
        {t("about")}
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            id={menuId}
            ref={menuRef}
            role="menu"
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            onKeyDown={handleKeyDown}
            className={cn(
              "absolute left-1/2 -translate-x-1/2 top-full mt-1 z-50 min-w-[10rem]",
              "rounded-lg border border-foreground/10 bg-popover p-1 shadow-lg ring-1 ring-foreground/5",
            )}
          >
            {ABOUT_SUBMENU_ITEMS.map((item, i) => (
              <li key={item.id} role="none">
                <a
                  role="menuitem"
                  href={onMain ? `#${item.anchor}` : `/#${item.anchor}`}
                  tabIndex={focusIndex === i ? 0 : -1}
                  onFocus={() => setFocusIndex(i)}
                  onClick={(event) => {
                    event.preventDefault();
                    handleSelect(item.anchor);
                  }}
                  className={cn(
                    "block w-full text-start px-3 py-2 rounded-md text-sm font-medium",
                    "text-popover-foreground hover:bg-accent hover:text-accent-foreground",
                    "focus-visible:outline-none focus-visible:bg-accent focus-visible:text-accent-foreground",
                    "transition-colors duration-150 cursor-pointer",
                  )}
                >
                  {tSub(item.id)}
                </a>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
