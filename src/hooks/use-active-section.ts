"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "@/i18n/navigation";

const SECTION_IDS = ["home", "about", "projects", "blog", "contact"] as const;
export type SectionId = (typeof SECTION_IDS)[number];

export function useActiveSection(): SectionId {
  const [activeSection, setActiveSection] = useState<SectionId>("home");
  const pathname = usePathname();

  const detectCurrentSection = useCallback(() => {
    const scrollY = window.scrollY + window.innerHeight * 0.3;
    for (let i = SECTION_IDS.length - 1; i >= 0; i--) {
      const el = document.getElementById(SECTION_IDS[i]);
      if (el && el.offsetTop <= scrollY) {
        setActiveSection(SECTION_IDS[i]);
        return;
      }
    }
    setActiveSection("home");
  }, []);

  useEffect(() => {
    // On pathname change (e.g. returning from blog), do an immediate check
    // because IntersectionObserver won't re-fire for already-visible elements.
    detectCurrentSection();

    const observers: IntersectionObserver[] = [];

    SECTION_IDS.forEach((id) => {
      const element = document.getElementById(id);
      if (!element) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(id);
            }
          });
        },
        {
          rootMargin: "-20% 0px -60% 0px",
          threshold: 0,
        }
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [pathname, detectCurrentSection]);

  return activeSection;
}
