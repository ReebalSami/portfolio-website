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
    // Throttled scroll listener — always detects the correct section
    // regardless of AnimatePresence timing or navigation method.
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          detectCurrentSection();
          ticking = false;
        });
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Delayed detection: AnimatePresence mode="wait" takes ~0.7s
    // (0.35s exit + 0.35s enter). Retry to catch when sections appear.
    const t1 = setTimeout(detectCurrentSection, 100);
    const t2 = setTimeout(detectCurrentSection, 500);
    const t3 = setTimeout(detectCurrentSection, 900);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [pathname, detectCurrentSection]);

  return activeSection;
}
