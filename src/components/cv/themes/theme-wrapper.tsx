import type { CvTheme } from "@/lib/cv/themes";
import { cn } from "@/lib/utils";

interface ThemeWrapperProps {
  theme: CvTheme;
  fontClassName?: string;
  children: React.ReactNode;
  printMode?: boolean;
  className?: string;
}

function buildStyleVars(
  theme: CvTheme,
): React.CSSProperties {
  const vars: Record<string, string> = {};

  for (const [key, value] of Object.entries(theme.cssVars)) {
    vars[key] = value;
  }

  vars["--foreground"] = theme.cssVars["--cv-text"];
  vars["--muted-foreground"] = theme.cssVars["--cv-muted"];
  vars["--background"] = theme.cssVars["--cv-bg"];
  vars["--border"] = theme.cssVars["--cv-border"];

  return vars as React.CSSProperties;
}

export function ThemeWrapper({
  theme,
  fontClassName,
  children,
  printMode = false,
  className,
}: ThemeWrapperProps) {
  const styleVars = buildStyleVars(theme);

  return (
    <div
      className={cn(
        "cv-theme-wrapper",
        `cv-theme-${theme.id}`,
        fontClassName,
        printMode && "cv-print-mode",
        className,
      )}
      style={styleVars}
      data-cv-theme={theme.id}
    >
      <article
        className={cn(
          "cv-layout mx-auto bg-[var(--cv-bg)] text-[var(--cv-text)]",
          "max-w-4xl",
          "print:max-w-none print:m-0",
          printMode && "max-w-none",
        )}
        style={{
          fontFamily: "var(--cv-font-body)",
        }}
      >
        {children}
      </article>
    </div>
  );
}

export type { ThemeWrapperProps };
