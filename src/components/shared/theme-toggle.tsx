"use client";

import { useTheme } from "@/components/theme-provider";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations("common");
  const locale = useLocale();
  const isDark = resolvedTheme === "dark";
  const isRtl = locale === "ar";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={t("toggleTheme")}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative inline-flex h-7 w-[52px] shrink-0 cursor-pointer items-center rounded-full border border-border bg-muted transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {/* Thumb with active icon inside */}
      <span
        className={cn(
          "pointer-events-none absolute flex h-5 w-5 items-center justify-center rounded-full bg-foreground shadow-sm transition-transform duration-300",
          isDark
            ? isRtl ? "translate-x-[3px]" : "translate-x-[27px]"
            : isRtl ? "translate-x-[27px]" : "translate-x-[3px]"
        )}
      >
        {isDark ? (
          <Moon className="h-3 w-3 text-background" />
        ) : (
          <Sun className="h-3 w-3 text-background" />
        )}
      </span>
    </button>
  );
}
