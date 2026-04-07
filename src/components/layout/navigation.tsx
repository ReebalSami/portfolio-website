"use client";

import { useTranslations } from "next-intl";
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

function scrollToSection(sectionId: string) {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
}

interface DesktopNavProps {
  className?: string;
}

export function DesktopNav({ className }: DesktopNavProps) {
  const activeSection = useActiveSection();
  const t = useTranslations("common.nav");

  return (
    <nav className={cn("hidden lg:flex items-center gap-1", className)}>
      {navItems.map((item) => (
        <button
          key={item.sectionId}
          onClick={() => scrollToSection(item.sectionId)}
          className={cn(
            "px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 cursor-pointer",
            activeSection === item.sectionId
              ? "text-foreground bg-accent"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
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

  const handleClick = (sectionId: string) => {
    onNavigate?.();
    setTimeout(() => scrollToSection(sectionId), 150);
  };

  return (
    <nav className="flex flex-col gap-1 py-4">
      {navItems.map((item) => (
        <button
          key={item.sectionId}
          onClick={() => handleClick(item.sectionId)}
          className={cn(
            "px-4 py-3 text-left text-base font-medium rounded-lg transition-colors duration-200 cursor-pointer",
            activeSection === item.sectionId
              ? "text-foreground bg-accent"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
          )}
        >
          {t(item.labelKey)}
        </button>
      ))}
    </nav>
  );
}
