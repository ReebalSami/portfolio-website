"use client";

import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useActiveSection, type SectionId } from "@/hooks/use-active-section";

export interface NavItem {
  labelKey: string;
  sectionId: SectionId;
}

export const navItems: NavItem[] = [
  { labelKey: "home", sectionId: "home" },
  { labelKey: "about", sectionId: "about" },
  { labelKey: "projects", sectionId: "projects" },
  { labelKey: "blog", sectionId: "blog" },
  { labelKey: "contact", sectionId: "contact" },
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

interface DesktopNavProps {
  className?: string;
}

export function DesktopNav({ className }: DesktopNavProps) {
  const activeSection = useActiveSection();
  const t = useTranslations("common.nav");
  const router = useRouter();
  const pathname = usePathname();
  const onMainPage = isMainPage(pathname);

  const handleClick = (sectionId: string) => {
    if (onMainPage) {
      scrollToSection(sectionId);
    } else {
      router.push(`/#${sectionId}`);
    }
  };

  return (
    <nav className={cn("hidden lg:flex items-center gap-1", className)}>
      {navItems.map((item) => (
        <button
          key={item.sectionId}
          onClick={() => handleClick(item.sectionId)}
          className={cn(
            desktopNavButtonBase,
            onMainPage && activeSection === item.sectionId
              ? "text-foreground bg-accent motion-safe:after:scale-x-100"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50 hover:after:scale-x-100"
          )}
        >
          {t(item.labelKey)}
        </button>
      ))}
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

  const handleClick = (sectionId: string) => {
    onNavigate?.();
    if (onMainPage) {
      setTimeout(() => scrollToSection(sectionId), 150);
    } else {
      router.push(`/#${sectionId}`);
    }
  };

  return (
    <nav className="flex flex-col gap-1 py-4">
      {navItems.map((item) => (
        <button
          key={item.sectionId}
          onClick={() => handleClick(item.sectionId)}
          className={cn(
            mobileNavButtonBase,
            onMainPage && activeSection === item.sectionId
              ? "text-foreground bg-accent motion-safe:after:scale-x-100"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50 hover:after:scale-x-100"
          )}
        >
          {t(item.labelKey)}
        </button>
      ))}
    </nav>
  );
}
