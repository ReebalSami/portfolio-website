"use client";

import { useTheme } from "@/components/theme-provider";
import { useTranslations } from "next-intl";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations("common");
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={t("toggleTheme")}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative inline-flex h-7 w-[52px] shrink-0 cursor-pointer items-center rounded-full border border-border bg-muted transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {/* Track icons */}
      <Sun className="absolute left-1.5 h-3.5 w-3.5 text-gallery-warm transition-opacity duration-300 opacity-100 dark:opacity-0" />
      <Moon className="absolute right-1.5 h-3.5 w-3.5 text-gallery-warm transition-opacity duration-300 opacity-0 dark:opacity-100" />

      {/* Thumb */}
      <span
        className="pointer-events-none inline-block h-5 w-5 rounded-full bg-foreground shadow-sm ring-0 transition-transform duration-300 translate-x-0.5 dark:translate-x-[27px]"
      />
    </button>
  );
}
