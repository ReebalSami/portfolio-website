"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDownIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { TransitionLink } from "@/components/shared/transition-link";
import { AboutDropdown, ABOUT_SUBMENU_ITEMS } from "@/components/layout/about-dropdown";
import { cn } from "@/lib/utils";
import { useActiveSection, type SectionId } from "@/hooks/use-active-section";

type SectionNavItem = {
  labelKey: string;
  sectionId: SectionId;
  type: "section";
};

type RouteNavItem = {
  labelKey: string;
  href: string;
  matchPrefix: string;
  type: "route";
};

export type NavItem = SectionNavItem | RouteNavItem;

export const navItems: NavItem[] = [
  { labelKey: "home", sectionId: "home", type: "section" },
  { labelKey: "about", sectionId: "about", type: "section" },
  { labelKey: "projects", sectionId: "projects", type: "section" },
  { labelKey: "blog", sectionId: "blog", type: "section" },
  { labelKey: "cv", href: "/cv", matchPrefix: "/cv", type: "route" },
  { labelKey: "contact", sectionId: "contact", type: "section" },
];

const desktopNavButtonBase =
  "relative px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 cursor-pointer after:pointer-events-none after:absolute after:left-3 after:right-3 after:bottom-1 after:h-0.5 after:rounded-full after:bg-foreground after:origin-left motion-safe:after:scale-x-0 motion-safe:after:transition-transform motion-safe:after:duration-200";

const mobileNavButtonBase =
  "relative px-4 py-3 text-left text-base font-medium rounded-lg transition-colors duration-200 cursor-pointer after:pointer-events-none after:absolute after:left-4 after:right-4 after:bottom-2 after:h-0.5 after:rounded-full after:bg-foreground after:origin-left motion-safe:after:scale-x-0 motion-safe:after:transition-transform motion-safe:after:duration-200";

function scrollToSection(sectionId: string) {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
}

function isMainPage(pathname: string): boolean {
  return pathname === "/" || pathname === "";
}

function isRouteActive(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

interface DesktopNavProps {
  className?: string;
  /**
   * When `true`, the "About" item becomes a hover-dropdown trigger
   * exposing Who / Journey / Tech sub-anchors. When `false`, it stays
   * a plain section button (legacy behaviour). Plumbed in from the
   * server-side `features.compactTimeline` flag via Header → here.
   */
  compactTimelineEnabled?: boolean;
}

export function DesktopNav({ className, compactTimelineEnabled = false }: DesktopNavProps) {
  const activeSection = useActiveSection();
  const t = useTranslations("common.nav");
  const router = useRouter();
  const pathname = usePathname();
  const onMainPage = isMainPage(pathname);

  const handleSectionClick = (sectionId: string) => {
    if (onMainPage) {
      scrollToSection(sectionId);
    } else {
      router.push(`/#${sectionId}`);
    }
  };

  return (
    <nav className={cn("hidden lg:flex items-center gap-1", className)}>
      {navItems.map((item) => {
        const isActive =
          item.type === "section"
            ? onMainPage && activeSection === item.sectionId
            : isRouteActive(pathname, item.matchPrefix);
        const activeClass = isActive
          ? "text-foreground bg-accent motion-safe:after:scale-x-100"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/50 hover:after:scale-x-100";

        if (item.type === "route") {
          return (
            <TransitionLink
              key={item.labelKey}
              href={item.href}
              className={cn(desktopNavButtonBase, activeClass)}
            >
              {t(item.labelKey)}
            </TransitionLink>
          );
        }

        // The About item gets the hover-dropdown treatment when the
        // compactTimeline feature is on. Other sections keep the
        // plain-button behaviour from before this change.
        if (item.sectionId === "about" && compactTimelineEnabled) {
          return (
            <AboutDropdown
              key="about-dropdown"
              triggerClassName={cn(desktopNavButtonBase, activeClass)}
              isParentActive={isActive}
            />
          );
        }

        return (
          <button
            key={item.sectionId}
            onClick={() => handleSectionClick(item.sectionId)}
            className={cn(desktopNavButtonBase, activeClass)}
          >
            {t(item.labelKey)}
          </button>
        );
      })}
    </nav>
  );
}

interface MobileNavProps {
  onNavigate?: () => void;
  /**
   * When `true`, the "About" item gets a chevron + inline accordion
   * exposing Who / Journey / Tech links inside the mobile sheet.
   */
  compactTimelineEnabled?: boolean;
}

export function MobileNav({ onNavigate, compactTimelineEnabled = false }: MobileNavProps) {
  const activeSection = useActiveSection();
  const t = useTranslations("common.nav");
  const tSub = useTranslations("common.nav.aboutSubmenu");
  const router = useRouter();
  const pathname = usePathname();
  const onMainPage = isMainPage(pathname);
  const reducedMotion = useReducedMotion() ?? false;

  const [aboutExpanded, setAboutExpanded] = useState(false);

  const handleSectionClick = (sectionId: string) => {
    onNavigate?.();
    if (onMainPage) {
      setTimeout(() => scrollToSection(sectionId), 150);
    } else {
      router.push(`/#${sectionId}`);
    }
  };

  const handleSubAnchorClick = (anchor: string) => {
    onNavigate?.();
    if (onMainPage) {
      setTimeout(() => scrollToSection(anchor), 150);
    } else {
      router.push(`/#${anchor}`);
    }
  };

  const handleRouteClick = () => {
    onNavigate?.();
  };

  return (
    <nav className="flex flex-col gap-1 py-4">
      {navItems.map((item) => {
        const isActive =
          item.type === "section"
            ? onMainPage && activeSection === item.sectionId
            : isRouteActive(pathname, item.matchPrefix);
        const activeClass = isActive
          ? "text-foreground bg-accent motion-safe:after:scale-x-100"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/50 hover:after:scale-x-100";

        if (item.type === "route") {
          return (
            <TransitionLink
              key={item.labelKey}
              href={item.href}
              onClick={handleRouteClick}
              className={cn(mobileNavButtonBase, activeClass)}
            >
              {t(item.labelKey)}
            </TransitionLink>
          );
        }

        if (item.sectionId === "about" && compactTimelineEnabled) {
          return (
            <div key="about-mobile-accordion" className="flex flex-col">
              <button
                type="button"
                onClick={() => setAboutExpanded((v) => !v)}
                className={cn(
                  mobileNavButtonBase,
                  activeClass,
                  "flex items-center justify-between",
                )}
                aria-expanded={aboutExpanded}
                aria-controls="about-mobile-submenu"
              >
                <span>{t(item.labelKey)}</span>
                <ChevronDownIcon
                  className={cn(
                    "size-4 transition-transform duration-200",
                    aboutExpanded && "rotate-180",
                  )}
                  aria-hidden="true"
                />
              </button>
              <AnimatePresence initial={false}>
                {aboutExpanded && (
                  <motion.ul
                    id="about-mobile-submenu"
                    initial={
                      reducedMotion
                        ? { opacity: 0 }
                        : { opacity: 0, height: 0 }
                    }
                    animate={
                      reducedMotion
                        ? { opacity: 1 }
                        : { opacity: 1, height: "auto" }
                    }
                    exit={
                      reducedMotion
                        ? { opacity: 0 }
                        : { opacity: 0, height: 0 }
                    }
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden ms-4 border-s border-foreground/10 ps-2 mt-1 mb-2 flex flex-col gap-0.5"
                  >
                    {ABOUT_SUBMENU_ITEMS.map((sub) => (
                      <li key={sub.id}>
                        <button
                          type="button"
                          onClick={() => handleSubAnchorClick(sub.anchor)}
                          className={cn(
                            "w-full text-start px-3 py-2 rounded-md text-sm font-medium",
                            "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                            "transition-colors duration-150 cursor-pointer",
                          )}
                        >
                          {tSub(sub.id)}
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          );
        }

        return (
          <button
            key={item.sectionId}
            onClick={() => handleSectionClick(item.sectionId)}
            className={cn(mobileNavButtonBase, activeClass)}
          >
            {t(item.labelKey)}
          </button>
        );
      })}
    </nav>
  );
}
