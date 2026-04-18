"use client";

import { useTranslations } from "next-intl";
import { useRouter, usePathname, Link } from "@/i18n/navigation";
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
}

export function DesktopNav({ className }: DesktopNavProps) {
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
            <Link
              key={item.labelKey}
              href={item.href}
              className={cn(desktopNavButtonBase, activeClass)}
            >
              {t(item.labelKey)}
            </Link>
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
}

export function MobileNav({ onNavigate }: MobileNavProps) {
  const activeSection = useActiveSection();
  const t = useTranslations("common.nav");
  const router = useRouter();
  const pathname = usePathname();
  const onMainPage = isMainPage(pathname);

  const handleSectionClick = (sectionId: string) => {
    onNavigate?.();
    if (onMainPage) {
      setTimeout(() => scrollToSection(sectionId), 150);
    } else {
      router.push(`/#${sectionId}`);
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
            <Link
              key={item.labelKey}
              href={item.href}
              onClick={handleRouteClick}
              className={cn(mobileNavButtonBase, activeClass)}
            >
              {t(item.labelKey)}
            </Link>
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
