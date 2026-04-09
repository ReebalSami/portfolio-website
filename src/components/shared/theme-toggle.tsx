"use client";

import { useTheme } from "@/components/theme-provider";
import { useTranslations } from "next-intl";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

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
      {/* Thumb — uses inset-inline-start for automatic RTL support */}
      <span
        className={cn(
          "pointer-events-none absolute flex h-5 w-5 items-center justify-center rounded-full bg-gallery-warm shadow-sm transition-all duration-300",
          isDark ? "start-[27px]" : "start-[3px]"
        )}
      >
        {isDark ? (
          <Moon className="h-3 w-3 text-foreground" />
        ) : (
          <Sun className="h-3 w-3 text-foreground" />
        )}
      </span>
    </button>
  );
}
